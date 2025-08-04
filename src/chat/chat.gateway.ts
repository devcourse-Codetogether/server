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

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('join')
  handleJoin(@MessageBody() sessionId: number, @ConnectedSocket() client: Socket) {
    client.join(`session-${sessionId}`);
  }

  @SubscribeMessage('chat')
  async handleMessage(
    @MessageBody()
    data: {
      sessionId: number;
      senderId: number;
      senderName: string;
      message: string;
    },
  ) {
    const saved = await this.chatService.saveMessage(data);
    this.server.to(`session-${data.sessionId}`).emit('chat', saved);
  }
}
