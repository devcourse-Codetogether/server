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

// namespace :collab-algorism(알고리즘 문제 풀이)
@WebSocketGateway({
  namespace: '/collab-algorism',
  cors: {
    origin: 'http://localhost:5173', // 반드시 명시
    credentials: true, // 클라이언트에서 withCredentials: true 쓸 때만
  },
})
export class CollabEditorAlgorismGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly redis: RedisCacheService) {}

  @WebSocketServer()
  server: Server;

  // 각 방마다 Y.Doc 저장
  private docs = new Map<string, Y.Doc>();

  // awareness 값(추후에 redis로 관리)
  private awarenessStates = new Map<string, Uint8Array>(); // socket.id → awareness 상태

  handleConnection(client: Socket) {
    console.log('🔌 클라이언트 연결됨:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log(this.awarenessStates);
    console.log(`❌ 연결 끊김: ${client.id}`);

    // 데이터 삭제
    this.awarenessStates.delete(client.id);
  }

  @SubscribeMessage('join')
  onJoin(@MessageBody() payload: { roomId: string }, @ConnectedSocket() client: Socket) {
    const { roomId } = payload;
    console.log('Join event');
    client.join(roomId);
    console.log('Join Socket Id: ', client.id);

    //서버에 해당 방에 대한 Yjs 문서가 아직 없다면
    if (!this.docs.has(roomId)) {
      //새 Yjs 문서를 생성해서 Map<string, Y.Doc>에 저장해둡니다.
      let doc = this.docs.get(roomId);
      if (!doc) {
        doc = new Y.Doc();
        this.docs.set(roomId, doc);
      }
    }
    //문서의 전체 상태를 담고 있음
    const doc = this.docs.get(roomId)!;

    //doc 전체 상태를 직렬화해서 Uint8Array형식으로 변환
    const update = Y.encodeStateAsUpdate(doc);

    client.emit('sync', update); // 문서 초기 상태 전송

    // 새로 들어온 사용자에게 기존 사용자들 마우스 커서 상태 전송
    this.awarenessStates.forEach(awarenessUpdate => {
      client.emit('awareness-update', awarenessUpdate);
    });
  }

  @SubscribeMessage('sync')
  onSync(@MessageBody() payload: { roomId: string }, @ConnectedSocket() client: Socket) {
    const { roomId } = payload;

    //서버에 해당 방에 대한 Yjs 문서가 아직 없다면
    if (!this.docs.has(roomId)) {
      //새 Yjs 문서를 생성해서 Map<string, Y.Doc>에 저장해둡니다.
      let doc = this.docs.get(roomId);
      if (!doc) {
        doc = new Y.Doc();
        this.docs.set(roomId, doc);
      }
    }
    //문서의 전체 상태를 담고 있음
    const doc = this.docs.get(roomId)!;

    //doc 전체 상태를 직렬화해서 Uint8Array형식으로 변환
    const update = Y.encodeStateAsUpdate(doc);

    client.emit('sync', update); // 문서 초기 상태 전송

    // 새로 들어온 사용자에게 기존 사용자들 마우스 커서 상태 전송
    this.awarenessStates.forEach(awarenessUpdate => {
      client.emit('awareness-update', awarenessUpdate);
    });
  }

  //  yjs update
  @SubscribeMessage('update')
  onUpdate(
    @MessageBody() payload: { roomId: string; update: Uint8Array },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, update } = payload;
    console.log('roomId:', roomId, 'update:', update);

    const doc = this.docs.get(roomId);
    if (!doc) return;

    // Uint8Array 형태로 반영
    Y.applyUpdate(doc, update); // 서버에 상태 반영
    client.to(roomId).emit('update', update); // 같은 방 사용자에게 브로드캐스트
  }

  // awareness update
  @SubscribeMessage('awareness-update')
  onAwarenessUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; update: Uint8Array },
  ) {
    const { roomId, update } = payload;
    this.awarenessStates.set(client.id, update);

    // 같은 방의 다른 사용자에게 전달
    client.to(roomId).emit('awareness-update', update);
  }

  // awareness update
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
