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

interface Message {
  time: string;
  sender: 'me' | 'other';
  text: string;
  name: string;
}

@WebSocketGateway({
  namespace: '/collab-webpublish',
  cors: {
    origin: 'http://localhost:5173', // 반드시 명시
    credentials: true, // 클라이언트에서 withCredentials: true 쓸 때만
  },
})
export class CollabEditorWebpublishGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly redis: RedisCacheService) {}
  @WebSocketServer()
  server: Server;

  // 각 방마다 Y.Doc 저장
  private docs = new Map<string, Y.Doc>();

  // awareness 값(추후에 redis로 관리)
  private awarenessStates = new Map<string, Uint8Array>(); // socket.id → awareness 상태

  handleConnection(client: Socket) {
    //redis 테스트
    this.redis.setData('redis 테스트(과연 성공하는가..)');
    console.log('🔌 collab-webpublish- 클라이언트 연결됨:', client.id);

    console.log('🔌 [webpublish] 연결됨:', client.id, client.nsp.name);

    console.log('사이즈:', this.docs.size);

    this.docs.forEach((doc, key) => {
      console.log('문서 내용이 안보이네?');
      const ytext = doc.getText('index.html');
      console.log('문서 내용:', key, ytext.toString());
    });
  }

  async handleDisconnect(client: Socket) {
    console.log(this.awarenessStates);
    console.log(`❌ 연결 끊김: ${client.id}`);

    this.docs.forEach((doc, key) => {
      const ytext = doc.getText('index.html');
      console.log('문서 내용:', key, ytext.toString());
    });

    // 데이터 삭제
    this.awarenessStates.delete(client.id);

    // redis 테스트
    const result = await this.redis.getData();
    console.log('result:', result);
  }

  @SubscribeMessage('join')
  onJoin(@MessageBody() payload: { roomId: string }, @ConnectedSocket() client: Socket) {
    const { roomId } = payload;
    console.log('Join event');
    client.join(roomId);
    console.log('Join Socket Id: ', client.id);

    // //서버에 해당 방에 대한 Yjs 문서가 아직 없다면
    // if (!this.docs.has(roomId)) {
    //   //새 Yjs 문서를 생성해서 Map<string, Y.Doc>에 저장해둡니다.
    //   let doc = this.docs.get(roomId);
    //   if (!doc) {
    //     doc = new Y.Doc();
    //     this.docs.set(roomId, doc);
    //   }
    // }
    // //문서의 전체 상태를 담고 있음
    // const doc = this.docs.get(roomId)!;

    // //doc 전체 상태를 직렬화해서 Uint8Array형식으로 변환
    // const update = Y.encodeStateAsUpdate(doc);

    // client.emit('sync', update); // 문서 초기 상태 전송

    // // 새로 들어온 사용자에게 기존 사용자들 마우스 커서 상태 전송
    // this.awarenessStates.forEach(awarenessUpdate => {
    //   client.emit('awareness-update', awarenessUpdate);
    // });
  }

  @SubscribeMessage('sync')
  onSync(
    @MessageBody() payload: { roomId: string; fileName: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, fileName } = payload;

    const key = `ydoc-${roomId}-${fileName}`;

    console.log('데이터 동기화:', key);
    //서버에 해당 방에 대한 Yjs 문서가 아직 없다면
    if (!this.docs.has(key)) {
      console.log('설마 키가 없다고 뜨는거야?');
      //새 Yjs 문서를 생성해서 Map<string, Y.Doc>에 저장해둡니다.
      let doc = this.docs.get(key);
      if (!doc) {
        console.log('설마 문서도 없다고 뜨는거야');
        doc = new Y.Doc();
        this.docs.set(key, doc);
      }
    }
    //문서의 전체 상태를 담고 있음
    const doc = this.docs.get(key)!;
    this.docs.forEach((doc, key) => {
      console.log(key, doc);
    });

    //doc 전체 상태를 직렬화해서 Uint8Array형식으로 변환
    const update = Y.encodeStateAsUpdate(doc);

    console.log('동기화 Yjs문서:', update);
    client.emit('sync', update); // 문서 초기 상태 전송

    // 새로 들어온 사용자에게 기존 사용자들 마우스 커서 상태 전송
    // 특정 roomId 및 channel에 해당하는 값만 전송
    this.awarenessStates.forEach((awarenessUpdate, key) => {
      // key 형식: awareness-roomId-filename-clientId
      if (key.startsWith(`awareness-${roomId}-${fileName}`)) {
        client.emit('awareness-update', awarenessUpdate);
      }
    });
  }

  //  yjs update
  @SubscribeMessage('update')
  onUpdate(
    @MessageBody() payload: { roomId: string; fileName: string; update: Uint8Array },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, fileName, update } = payload;
    console.log('roomId:', roomId, 'filename:', fileName, 'update:', update);

    const key = `ydoc-${roomId}-${fileName}`;

    console.log('key:', key);

    const doc = this.docs.get(key);
    if (!doc) return;

    // Uint8Array 형태로 반영
    Y.applyUpdate(doc, update); // 서버에 상태 반영
    client.to(roomId).emit('update', update); // 같은 방 사용자에게 브로드캐스트
  }

  // awareness update
  @SubscribeMessage('awareness-update')
  onAwarenessUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; fileName: string; update: Uint8Array },
  ) {
    const { roomId, fileName, update } = payload;

    const key = `awareness-${client.id}-${roomId}-${fileName}`;
    console.log('awareness update:', key);

    this.awarenessStates.set(key, update);
    // 같은 방의 다른 사용자에게 전달
    client.to(roomId).emit('awareness-update', { update, fileName });
  }

  // awareness remove
  @SubscribeMessage('awareness-remove')
  onAwarenessRemove(@ConnectedSocket() client: Socket, @MessageBody() payload: { roomId: string }) {
    const { roomId } = payload;

    for (const key of this.awarenessStates.keys()) {
      if (key.startsWith(`awareness-${client.id}-${roomId}-`)) {
        console.log('삭제할 키:', key);
        this.awarenessStates.delete(key);
      }
    }
  }

  // awareness chat
  @SubscribeMessage('chat')
  onChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; newMessage: Message },
  ) {
    const roomId = payload.roomId;

    let newMessage = payload.newMessage;

    newMessage = { ...newMessage, sender: 'other' };

    console.log(newMessage);
    // 같은 방의 다른 사용자에게 전달
    client.to(roomId).emit('chat', newMessage);
  }
}
