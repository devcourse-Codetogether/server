import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisCacheService implements OnModuleInit {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async onModuleInit() {
    // ✅ 연결 보장
    if (this.redis.status !== 'ready') {
      await new Promise<void>((resolve, reject) => {
        this.redis.once('ready', resolve);
        this.redis.once('error', reject);
      });
    }
    console.log('✅ Redis에 초기값 저장됨');
  }

  setData(data: string) {
    const bufferYjs = Buffer.from(data);
    console.log(new Uint8Array(bufferYjs));

    this.redis.set('test', bufferYjs);
  }

  async getData() {
    const result = await this.redis.get('test');
    return result;
  }
}
