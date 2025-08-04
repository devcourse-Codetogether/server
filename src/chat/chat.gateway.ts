import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Inject } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { RedisClientType } from 'redis';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    @Inject('REDIS_PUB_CLIENT') private readonly redisPubClient: RedisClientType,
    @Inject('REDIS_SUB_CLIENT') private readonly redisSubClient: RedisClientType,
  ) {}

  async afterInit() {
    console.log('ChatGateway 생성됨');

    await this.redisSubClient.pSubscribe('chat-*', message => {
      const parsed = JSON.parse(message);
      const sessionId = parsed.sessionId;

      this.server.to(`session-${sessionId}`).emit('chat', parsed);
      console.log(
        `[Redis 수신] session-${sessionId}: ${parsed.senderNickname} - ${parsed.message}`,
      );
    });
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

    const payload = {
      id: saved.id,
      sessionId: saved.sessionId,
      senderId: saved.senderId,
      senderNickname: saved.sender.nickname,
      message: saved.message,
      createdAt: saved.createdAt,
    };

    await this.redisPubClient.publish(`chat-${data.sessionId}`, JSON.stringify(payload));
    console.log(
      `[Redis 발행] session-${data.sessionId}: ${payload.senderNickname} - ${payload.message}`,
    );
  }
}
