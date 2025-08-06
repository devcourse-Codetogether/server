import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CodeService } from './code.service';
import { ExecuteCodeDto } from './dto/execute-code.dto';
import { User } from 'src/user/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('sessions/:sessionId/code')
export class CodeController {
  constructor(private readonly codeService: CodeService) {}
  @UseGuards(JwtAuthGuard)
  @Post('execute')
  async execute(@Param('sessionId') sessionId: string, @Body() dto: ExecuteCodeDto) {
    const result = await this.codeService.executeCode(dto.language, dto.code);
    return { output: result };
  }
  @UseGuards(JwtAuthGuard)
  @Put()
  async saveCode(
    @Param('sessionId') sessionId: string,
    @Body() dto: ExecuteCodeDto,
    @User() user: any,
  ) {
    return this.codeService.saveCodeLog(+sessionId, user.id, dto);
  }
}
