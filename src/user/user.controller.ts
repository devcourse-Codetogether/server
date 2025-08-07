import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from './decorators/user.decorator';
import { UserDto } from './dto/user.dto';

@Controller('users/me')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  async getMySessions(@User() user: UserDto) {
    return this.userService.getMySessions(user.id);
  }
  @UseGuards(JwtAuthGuard)
  @Get('sessions/:sessionId/chats')
  async getRecentChats(@Param('sessionId', ParseIntPipe) sessionId: number) {
    const messages = await this.userService.getMessages(sessionId);
    return messages;
  }
  @UseGuards(JwtAuthGuard)
  @Get('sessions/:sessionId/code')
  async getCodeLogs(@Param('sessionId') sessionId: string) {
    return this.userService.getCodeLogs(+sessionId);
  }
}
