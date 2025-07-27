import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';
import { UserPayload } from '../auth/types/user-payload.interface';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me/sessions')
  async getMySessions(@User() user: UserPayload) {
    return this.userService.getMySessions(user.id);
  }
}
