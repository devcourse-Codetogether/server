import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
  ) {}

  async loginWithKakao(code: string) {
    const accessTokenFromKakao = await this.fetchAccessToken(code);
    if (!accessTokenFromKakao) {
      throw new UnauthorizedException('Access token 발급 실패');
    }

    const kakaoUser = await this.fetchKakaoUser(accessTokenFromKakao);
    if (!kakaoUser) {
      throw new UnauthorizedException('카카오 사용자 정보를 불러올 수 없습니다.');
    }

    const { id, properties } = kakaoUser;
    const nickname = properties?.nickname;

    let user = await this.userService.findByKakaoId(id);
    if (!user) {
      user = await this.userService.createWithKakao({ kakaoId: id, nickname });
    }

    // 토큰 생성
    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    // Refresh Token DB 저장
    await this.userService.updateRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      user: {
        id: user.id,
        nickname: user.nickname,
      },
      refreshToken, // 추후 쿠키로 전달할 것
    };
  }

  generateAccessToken(userId: number): string {
    const payload = { sub: userId };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
    });
  }

  generateRefreshToken(userId: number): string {
    const payload = { sub: userId };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });
  }

  async validateRefreshToken(userId: number, token: string): Promise<User> {
    const user = await this.userService.findById(userId);
    if (!user || user.refreshToken !== token) {
      throw new UnauthorizedException('Refresh Token 불일치');
    }
    return user;
  }

  async removeRefreshToken(userId: number) {
    await this.userService.removeRefreshToken(userId);
  }

  private async fetchAccessToken(code: string): Promise<string | null> {
    const url = 'https://kauth.kakao.com/oauth/token';
    const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID;
    const KAKAO_REDIRECT_URI = process.env.KAKAO_REDIRECT_URI;

    const body = new URLSearchParams([
      ['grant_type', 'authorization_code'],
      ['client_id', KAKAO_CLIENT_ID ?? ''],
      ['redirect_uri', KAKAO_REDIRECT_URI ?? ''],
      ['code', code],
    ]);

    try {
      const res = await firstValueFrom(
        this.httpService.post(url, body.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      );
      return res.data.access_token;
    } catch (err) {
      console.error('카카오 access_token 요청 실패:', err?.response?.data || err.message);
      return null;
    }
  }

  private async fetchKakaoUser(accessToken: string) {
    const url = 'https://kapi.kakao.com/v2/user/me';

    try {
      const res = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      return res.data;
    } catch (err) {
      console.error('카카오 사용자 조회 실패:', err?.response?.data || err.message);
      return null;
    }
  }
}
