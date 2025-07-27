import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginKakaoDto } from './dto/login-kakao.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('kakao')
  async kakaoLogin(@Body('code') code: string) {
    return this.authService.loginWithKakao(code);
  }
}
