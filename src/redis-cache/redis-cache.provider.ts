// redis.provider.ts
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const RedisCacheProvider = {
  provide: 'REDIS_CLIENT',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return new Redis({
      host: configService.get<string>('REDIS_HOST'),
      port: parseInt(configService.get<string>('REDIS_PORT') || '6379'),
      //   password: configService.get<string>('REDIS_PASSWORD') || undefined,
    });
  },
};
