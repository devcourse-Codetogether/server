import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async loginWithKakao(accessToken: string) {
    const kakaoUser = await this.fetchKakaoUser(accessToken);
    if (!kakaoUser) {
      throw new UnauthorizedException('카카오 사용자 정보를 불러올 수 없습니다.');
    }

    const { id, properties } = kakaoUser;
    const nickname = properties?.nickname;

    let user = await this.userService.findByKakaoId(id);
    if (!user) {
      user = await this.userService.createWithKakao({ kakaoId: id, nickname });
    }

    const payload = { sub: user.id };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
      },
    };
  }

  private async fetchKakaoUser(accessToken: string) {
    const url = 'https://kapi.kakao.com/v2/user/me';

    try {
      const res = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      );
      return res.data;
    } catch (err) {
      return null;
    }
  }
}
