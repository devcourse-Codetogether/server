import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CollabEditorWebpublishGateway } from './collab-editor-webpublish/collab-editor-webpublish.gateway';
import { RedisCacheModule } from './redis-cache/redis-cache.module';
import { RedisCacheService } from './redis-cache/redis-cache.service';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CodeModule } from './code/code.module';
import { SessionModule } from './session/session.module';
import { CollabEditorAlgorismGateway } from './collab-editor/collab-editor-algorism.gateway';
import { AiReviewModule } from './ai-review/ai-review.module';
import { ChatModule } from './chat/chat.module';
import { redisProvider } from './redis/redis.provider';
import { CollabEditorWebpublishService } from './collab-editor-webpublish/collab-editor-webpublish.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 다른 모듈에서도 ConfigService 주입 없이 사용 가능
    }),
    RedisCacheModule,
    PrismaModule,
    AuthModule,
    UserModule,
    CodeModule,
    SessionModule,
    AiReviewModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    CollabEditorWebpublishGateway,
    CollabEditorAlgorismGateway,
    RedisCacheService,
    ...redisProvider,
    CollabEditorWebpublishService,
  ],
})
export class AppModule {}
