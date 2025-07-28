import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findById(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async getMySessions(userId: number) {
    return this.userRepository.findUserSessions(userId);
  }
  async findByKakaoId(kakaoId: number) {
    return this.prisma.user.findUnique({
      where: { kakaoId },
    });
  }
  async createWithKakao(data: { kakaoId: number; nickname: string }) {
    return this.prisma.user.create({
      data,
    });
  }
  async updateRefreshToken(userId: number, token: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: token },
    });
  }

  async removeRefreshToken(userId: number): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }
}
