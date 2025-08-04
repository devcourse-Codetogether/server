import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CollabEditorAlgorismGateway } from './collab-editor/collab-editor-algorism.gateway';
import { CollabEditorWebpublishGateway } from './collab-editor-webpublish/collab-editor-webpublish.gateway';
import { RedisCacheModule } from './redis-cache/redis-cache.module';
import { RedisCacheService } from './redis-cache/redis-cache.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 다른 모듈에서도 ConfigService 주입 없이 사용 가능
    }),
    RedisCacheModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    CollabEditorWebpublishGateway,
    CollabEditorAlgorismGateway,
    RedisCacheService,
  ],
})
export class AppModule {}
