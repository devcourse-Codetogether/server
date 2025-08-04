import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { ioRedisStore } from '@tirke/node-cache-manager-ioredis';
import { RedisCacheService } from './redis-cache.service';
import { RedisCacheProvider } from './redis-cache.provider';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: ioRedisStore({ redisInstance: RedisCacheProvider }), // ✅ 같은 인스턴스 재사용
        ttl: 0,
      }),
    }),
  ],
  providers: [RedisCacheProvider, RedisCacheService],
  exports: [RedisCacheProvider],
})
export class RedisCacheModule {}
