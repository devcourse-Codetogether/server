import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
// import { Message } from 'src/collab-editor-webpublish/collab-editor-webpublish.gateway';
import { buffer, json } from 'stream/consumers';

interface Message {
  nickname: string;
  time: string;
  content: string;
}

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

  // ============== ydoc ================

  // Doc 조회
  redisGetDoc = async (key: string) => {
    const doc = await this.redis.getBuffer(key);
    return doc;
  };

  // Doc 값 업데이트
  redisUpdateDoc = async (key: string, value: Uint8Array) => {
    const binary = Buffer.from(value);
    console.log('doc 업데이트:', key);
    const result = await this.redis.set(key, binary);
    console.log('Y Doc 값 :', result);
  };

  // ===================awareness==============

  // awarenss 값 삭제(특정 Id)
  redisDeleteAwareness = async (key: string) => {
    //Scan
    const stream = await this.redis.scanStream({
      match: key,
      count: 100, // 최대 100개씩 한 번에
    });

    for await (const keys of stream) {
      await Promise.all(keys.map(key => this.redis.del(key)));
    }
  };

  // awareness 값 업데이트
  redisUpdateAwareness = async (key: string, value: Uint8Array) => {
    const buffer = Buffer.from(value);

    const result = await this.redis.set(key, buffer);

    console.log('awarenss 업데이트:', result);
  };

  // sync awareness 데이터 조회
  redisGetSyncAwareness = async (key: string) => {
    const allKeyValueList: Buffer[] = [];
    //Scan
    const stream = await this.redis.scanStream({
      match: key,
      count: 100, // 최대 100개씩 한 번에
    });

    for await (const keys of stream) {
      const values = await Promise.all(keys.map(key => this.redis.getBuffer(key)));

      values.map(awareness => {
        allKeyValueList.push(awareness);
      });
    }

    return allKeyValueList;
  };

  // =============================chat
  // chat 데이터 가져오기
  redisGetChat = async (key: string) => {
    const messages = await this.redis.lrange(key, 0, -1);
    const parsedMessages = messages.map(msg => JSON.parse(msg));

    return parsedMessages;
  };

  // chat 데이터 업데이트
  redisUpdateChat = async (key: string, msg: Message) => {
    // JS객체에서 JSON으로 변환
    await this.redis.rpush(key, JSON.stringify(msg));
  };
}
