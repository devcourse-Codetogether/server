import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CollabEditorAlgorismGateway } from './collab-editor/collab-editor-algorism.gateway';
import { CollabEditorWebpublishGateway } from './collab-editor-webpublish/collab-editor-webpublish.gateway';
import { RedisCacheModule } from './redis-cache/redis-cache.module';
import { RedisCacheService } from './redis-cache/redis-cache.service';

@Module({
  imports: [RedisCacheModule],
  controllers: [AppController],
  providers: [
    AppService,
    CollabEditorWebpublishGateway,
    CollabEditorAlgorismGateway,
    RedisCacheService,
  ],
})
export class AppModule {}
