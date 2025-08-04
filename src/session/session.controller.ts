import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../user/decorators/user.decorator';
import { UserDto } from '../user/dto/user.dto';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  getSessionList(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.sessionService.getSessionList(Number(page), Number(limit));
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createSession(@User() user: UserDto, @Body() dto: CreateSessionDto) {
    return this.sessionService.createSession(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  joinSessionById(@User() user: UserDto, @Param('id', ParseIntPipe) sessionId: number) {
    return this.sessionService.joinSessionById(user.id, sessionId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':sessionId/end')
  endSession(@User() user: UserDto, @Param('sessionId') sessionId: number) {
    return this.sessionService.endSession(user.id, Number(sessionId));
  }
  @UseGuards(JwtAuthGuard)
  @Get('/:sessionId/chats')
  async getRecentChats(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Query('limit') limit?: string,
  ) {
    const take = limit ? parseInt(limit, 10) : 15;
    const messages = await this.sessionService.getRecentMessages(sessionId, take);
    return messages;
  }
}
