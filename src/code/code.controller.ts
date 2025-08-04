import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CodeService } from './code.service';
import { ExecuteCodeDto } from './dto/execute-code.dto';
import { User } from 'src/user/decorators/user.decorator';

@Controller('sessions/:sessionId/code')
export class CodeController {
  constructor(private readonly codeService: CodeService) {}

  @Post('execute')
  async execute(@Param('sessionId') sessionId: string, @Body() dto: ExecuteCodeDto) {
    const result = await this.codeService.executeCode(dto.language, dto.code);
    return { output: result };
  }
  @Put()
  async saveCode(
    @Param('sessionId') sessionId: string,
    @Body() dto: ExecuteCodeDto,
    @User('id') senderId: number,
  ) {
    return this.codeService.saveCodeLog(+sessionId, senderId, dto);
  }

  @Get()
  async getCodeLogs(@Param('sessionId') sessionId: string) {
    return this.codeService.getCodeLogs(+sessionId);
  }
}
