import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':sessionId')
  async getChatLogs(@Param('sessionId') sessionId: string) {
    return this.chatService.getMessagesBySession(Number(sessionId));
  }
  @Get('/sessions/:sessionId/chats')
  async getRecentChats(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Query('limit') limit?: string,
  ) {
    const take = limit ? parseInt(limit, 10) : 15;
    const messages = await this.chatService.getRecentMessages(sessionId, take);
    return messages;
  }
}
