import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getMySessions(userId: number) {
    return this.userRepository.findUserSessions(userId);
  }
}
