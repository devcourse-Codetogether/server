import { Controller, Post, Req, Res, Body, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { UserService } from '../user/user.service';
import { RefreshRequest } from './types/types';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('kakao')
  async loginWithKakao(@Body('code') code: string, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, user } = await this.authService.loginWithKakao(code);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
    });

    return { accessToken, user };
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(@Req() req: RefreshRequest, @Res({ passthrough: true }) res: Response) {
    const userId = req.user['sub'];
    const refreshToken = req.cookies['refresh_token'];

    const user = await this.authService.validateRefreshToken(userId, refreshToken);

    const newAccessToken = this.authService.generateAccessToken(user.id);
    const newRefreshToken = this.authService.generateRefreshToken(user.id);

    await this.userService.updateRefreshToken(user.id, newRefreshToken);

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return { accessToken: newAccessToken };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) throw new UnauthorizedException('RefreshToken 없음');

    try {
      const payload = await this.authService['jwtService'].verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      await this.authService.removeRefreshToken(payload.sub);
      res.clearCookie('refresh_token');
      return { message: '로그아웃 완료' };
    } catch {
      throw new UnauthorizedException('토큰 검증 실패');
    }
  }
}
