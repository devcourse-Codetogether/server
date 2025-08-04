import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CodeModule } from './code/code.module';
import { SessionModule } from './session/session.module';
import { CollabEditorWebpublishGateway } from './collab-editor/collab-editor-webpublish.gateway';
import { CollabEditorAlgorismGateway } from './collab-editor/collab-editor-algorism.gateway';
import { AiReviewModule } from './ai-review/ai-review.module';
import { ChatModule } from './chat/chat.module';
import { redisProvider } from './redis/redis.provider';

@Module({
  imports: [
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
    ...redisProvider,
  ],
})
export class AppModule {}
