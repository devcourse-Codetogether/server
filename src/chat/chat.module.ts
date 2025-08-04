import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import Redis from 'ioredis';
import { redisProvider } from 'src/redis/redis.provider';

@Module({
  providers: [ChatGateway, ChatService, PrismaService, ...redisProvider],
  controllers: [ChatController],
})
export class ChatModule {}
