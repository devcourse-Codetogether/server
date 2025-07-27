import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CodeService {
  private readonly judge0Url = 'https://judge0-ce.p.rapidapi.com/submissions';
  private readonly headers = {
    'Content-Type': 'application/json',
    'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
  };

  constructor(private readonly httpService: HttpService) {}

  async executeCode(language: string, sourceCode: string): Promise<string> {
    const langId = this.getLanguageId(language);
    const submission = {
      source_code: sourceCode,
      language_id: langId,
    };

    const { data: submitRes } = await firstValueFrom(
      this.httpService.post(`${this.judge0Url}?base64_encoded=false&wait=true`, submission, {
        headers: this.headers,
      }),
    );

    return submitRes.stdout || submitRes.stderr || 'No output';
  }

  private getLanguageId(language: string): number {
    const langMap = {
      python: 71,
      javascript: 63,
      cpp: 54,
      java: 62,
    };
    return langMap[language] ?? 71;
  }
}
