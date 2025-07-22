import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CollabEditorWebpublishGateway } from './collab-editor/collab-editor-webpublish.gateway';
import { CollabEditorAlgorismGateway } from './collab-editor/collab-editor-algorism.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, CollabEditorWebpublishGateway, CollabEditorAlgorismGateway],
})
export class AppModule {}
