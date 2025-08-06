import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OpenAiService {
  private readonly apiKey = process.env.OPENAI_API_KEY;
  private readonly model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  async send(prompt: string): Promise<string> {
    const url = 'https://api.openai.com/v1/chat/completions';

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    };

    const data = {
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    };

    const response = await axios.post(url, data, { headers });
    const answer = response.data.choices?.[0]?.message?.content?.trim();
    return answer ?? 'AI 응답을 가져올 수 없습니다.';
  }
}
