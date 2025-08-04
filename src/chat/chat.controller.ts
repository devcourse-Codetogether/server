import { Controller, Get, Param } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':sessionId')
  async getChatLogs(@Param('sessionId') sessionId: string) {
    return this.chatService.getMessagesBySession(Number(sessionId));
  }
}
