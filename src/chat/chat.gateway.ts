import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {
    console.log('ChatGateway 생성됨');
  }

  @SubscribeMessage('join')
  handleJoin(@MessageBody() sessionId: number, @ConnectedSocket() client: Socket) {
    console.log(`클라이언트 연결됨! 세션 ${sessionId}`);
    client.join(`session-${sessionId}`);
  }

  @SubscribeMessage('chat')
  async handleMessage(
    @MessageBody()
    data: { sessionId: number; senderId: number; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    const saved = await this.chatService.saveMessage(data);
    console.log(` 메시지 수신: ${saved.sender.nickname} - ${data.message}`);
    this.server.to(`session-${data.sessionId}`).emit('chat', {
      id: saved.id,
      sessionId: saved.sessionId,
      senderId: saved.senderId,
      senderNickname: saved.sender.nickname,
      message: saved.message,
      createdAt: saved.createdAt,
    });
  }
}
