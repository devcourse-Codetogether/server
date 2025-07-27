import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CodeModule } from './code/code.module';
import { SessionModule } from './session/session.module';

@Module({
  imports: [PrismaModule, AuthModule, UserModule, CodeModule, SessionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
