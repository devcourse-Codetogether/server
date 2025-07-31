import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OpenAiService {
  private readonly apiKey = process.env.OPENAI_API_KEY;
  private readonly model = process.env.OPENAI_MODEL || 'gpt-4o-mini'; // 모델을 지정

  async send(prompt: string): Promise<string> {
    const url = 'https://api.openai.com/v1/chat/completions';

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    };

    const data = {
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      // 기본적으로 1개 메시지만 보내고 있음 (user → assistant)
      // 원한다면 대화형 맥락도 줄 수 있음
      temperature: 0.7,
      // 0 ~ 2 사이의 값
      // 낮을수록 더 일관된 결과 (정확도 우선)
      // 높을수록 더 창의적인 결과 (자유로운 응답)
    };

    const response = await axios.post(url, data, { headers });
    const answer = response.data.choices?.[0]?.message?.content?.trim();
    return answer ?? 'AI 응답을 가져올 수 없습니다.';
  }
}
