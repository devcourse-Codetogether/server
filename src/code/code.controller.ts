import { Body, Controller, Param, Post } from '@nestjs/common';
import { CodeService } from './code.service';
import { ExecuteCodeDto } from './dto/execute-code.dto';

@Controller('sessions/:sessionId/code')
export class CodeController {
  constructor(private readonly codeService: CodeService) {}

  @Post('execute')
  async execute(@Param('sessionId') sessionId: string, @Body() dto: ExecuteCodeDto) {
    const result = await this.codeService.executeCode(dto.language, dto.code);
    return { output: result };
  }
}
