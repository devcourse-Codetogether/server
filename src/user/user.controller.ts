import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from './decorators/user.decorator';
import { UserDto } from './dto/user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me/sessions')
  async getMySessions(@User() user: UserDto) {
    // return this.userService.getMySessions(user.id);
  }
}
