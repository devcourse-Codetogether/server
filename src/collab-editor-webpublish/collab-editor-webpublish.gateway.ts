import { ConfigService } from '@nestjs/config';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisCacheService } from 'src/redis-cache/redis-cache.service';
import * as Y from 'yjs';
import { CollabEditorWebpublishService } from './collab-editor-webpublish.service';
import { ChatService } from 'src/chat/chat.service';
import { identity } from 'rxjs';

export interface Message {
  nickname: string;
  time: string;
  content: string;
}

@WebSocketGateway({
  namespace: '/collab-webpublish',
  cors: {
    origin: process.env.CLIENT_HOST, // 반드시 명시
    credentials: true, // 클라이언트에서 withCredentials: true 쓸 때만
  },
})
export class CollabEditorWebpublishGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly redis: RedisCacheService,
    private readonly collabService: CollabEditorWebpublishService,
    private readonly chatService: ChatService,
  ) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('🔌 collab-webpublish- 클라이언트 연결됨:', client.id);

    console.log('🔌 [webpublish] 연결됨:', client.id, client.nsp.name);
  }

  async handleDisconnect(client: Socket) {
    console.log(`❌ 연결 끊김: ${client.id}`);
  }

  @SubscribeMessage('join')
  onJoin(@MessageBody() payload: { roomId: string }, @ConnectedSocket() client: Socket) {
    const { roomId } = payload;
    console.log('Join event');
    client.join(roomId);
    console.log('Join Socket Id: ', client.id);
  }

  @SubscribeMessage('chat-sync')
  async onChatSync(@MessageBody() payload: { roomId: string }, @ConnectedSocket() client: Socket) {
    const { roomId } = payload;

    const key = `chat-${roomId}`;

    console.log('데이터 동기화:', key);

    // chat 데이터 동기화 (배열 가져오기)
    const syncChat = await this.redis.redisGetChat(key);
    // 만약 redis에 없으면 DB에서 가져오기
    if (syncChat.length === 0) {
      const messages = await this.chatService.getMessagesBySession(roomId);
      console.log('Messages:', messages);

      const arrMessages: Message[] = [];

      messages.map(msg => {
        const {
          message,
          createdAt,
          sender: { nickname },
        } = msg;
        const newMsg = { nickname, time: createdAt.toLocaleTimeString(), content: message };

        arrMessages.push(newMsg);
      });
      client.emit('chat-sync', arrMessages);
    } else {
      client.emit('chat-sync', syncChat);
    }
  }

  @SubscribeMessage('sync')
  async onSync(
    @MessageBody() payload: { roomId: string; fileName: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, fileName } = payload;

    const key = `ydoc-${roomId}-${fileName}`;

    console.log('데이터 동기화:', key);

    // redis에서 doc값 가져오기
    let syncDoc = await this.redis.redisGetDoc(key);
    let update;

    if (!syncDoc) {
      // DB에서 가져오기
      const dbGetDoc = await this.collabService.getDoc({ roomId, fileName });
      // 만약 DB에도 없으면 doc 인스턴스 새로 생성
      if (!dbGetDoc) {
        const doc = new Y.Doc();
        //doc 전체 상태를 직렬화해서 Uint8Array형식으로 변환
        update = Y.encodeStateAsUpdate(doc);
        //db에 저장
        const result = await this.collabService.createDoc({ roomId, fileName, update });
        console.log('result:', result);
      } else {
        console.log('db에서 doc 데이터 가져옴:', dbGetDoc.binaryDoc);
        update = new Uint8Array(dbGetDoc.binaryDoc);
      }

      await this.redis.redisUpdateDoc(key, update);
    } else {
      update = syncDoc;
    }

    console.log('동기화 Yjs문서:', update);
    client.emit('sync', update); // 문서 초기 상태 전송

    // 새로 들어온 사용자에게 기존 사용자들 마우스 커서 상태 전송
    // 특정 roomId 및 channel에 해당하는 값만 전송
    const Awarenesskey = `awareness-${roomId}-${fileName}*`;

    const syncAwareness = await this.redis.redisGetSyncAwareness(Awarenesskey);

    if ((await syncAwareness).length > 0) {
      (await syncAwareness).map(awarenessUpdate => {
        console.log('awreness:', awarenessUpdate);
        client.emit('awareness-update', awarenessUpdate);
      });
    } else {
    }
  }

  //  yjs update
  @SubscribeMessage('update')
  async onUpdate(
    @MessageBody() payload: { roomId: string; fileName: string; update: Uint8Array },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, fileName, update } = payload;
    console.log(
      'roomId:',
      roomId,
      'filename:',
      fileName,
      'clientId:',
      client.id,
      'client:',
      new Uint8Array(update),
    );

    const key = `ydoc-${roomId}-${fileName}`;

    console.log('key:', key);

    // 기존 데이터 가져오기
    const beforeYdoc = await this.redis.redisGetDoc(key);

    const doc = new Y.Doc();

    // 기존 상태 있으면 먼저 적용
    if (beforeYdoc) {
      Y.applyUpdate(doc, new Uint8Array(beforeYdoc));
    }

    // 이후 다시 update 적용
    Y.applyUpdate(doc, new Uint8Array(update));

    // 병합된 전체 상태를 Redis에 다시 저장
    const mergedUpdate = Y.encodeStateAsUpdate(doc);

    //redis 저장
    await this.redis.redisUpdateDoc(key, mergedUpdate);

    //db 저장
    await this.collabService.updateDoc({ roomId, fileName, mergedUpdate });

    // Uint8Array 형태로 반영
    // Y.applyUpdate(doc, update); // 서버에 상태 반영
    client.to(roomId).emit('update', update); // 같은 방 사용자에게 브로드캐스트
  }

  // awareness update
  @SubscribeMessage('awareness-update')
  async onAwarenessUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; fileName: string; update: Uint8Array },
  ) {
    const { roomId, fileName, update } = payload;

    const key = `awareness-${client.id}-${roomId}-${fileName}`;
    console.log('awareness update:', key);

    await this.redis.redisUpdateAwareness(key, update);

    // 같은 방의 다른 사용자에게 전달
    client.to(roomId).emit('awareness-update', { update, fileName });
  }

  // awareness remove
  @SubscribeMessage('awareness-remove')
  async onAwarenessRemove(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string },
  ) {
    const { roomId } = payload;

    const key = `awareness-${client.id}-${roomId}*`;

    await this.redis.redisDeleteAwareness(key);
  }

  // chat
  @SubscribeMessage('chat')
  async onChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; newMessage: Message; userId: number },
  ) {
    const roomId = payload.roomId;

    let newMessage = payload.newMessage;

    const userId = payload.userId;

    console.log('문자 메시지:', newMessage);
    console.log('userId:', userId);

    const key = `chat-${roomId}`;

    // 기존 배열이 있으면 가져오고, 없으면 새 배열 생성
    await this.redis.redisUpdateChat(key, newMessage);

    const msgData = { sessionId: roomId, senderId: userId, message: newMessage.content };

    // DB 저장
    const result = this.chatService.saveMessage(msgData);

    // 같은 방의 다른 사용자에게 전달
    client.to(roomId).emit('chat', newMessage);
  }
}
