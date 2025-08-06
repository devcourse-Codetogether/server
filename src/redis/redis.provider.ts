//redis.provider.ts;
import { createClient } from 'redis';

export const redisProvider = [
  {
    provide: 'REDIS_PUB_CLIENT',
    useFactory: async () => {
      const client = createClient({
        url: `redis://@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
      });
      await client.connect();
      return client;
    },
  },
  {
    provide: 'REDIS_SUB_CLIENT',
    useFactory: async () => {
      const client = createClient({
        url: `redis://@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
      });
      await client.connect();
      return client;
    },
  },
];
