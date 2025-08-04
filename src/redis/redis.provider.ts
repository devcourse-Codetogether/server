import { createClient } from 'redis';

export const redisPubClient = createClient();
export const redisSubClient = redisPubClient.duplicate();

export const redisProvider = [
  {
    provide: 'REDIS_PUB_CLIENT',
    useFactory: async () => {
      await redisPubClient.connect();
      return redisPubClient;
    },
  },
  {
    provide: 'REDIS_SUB_CLIENT',
    useFactory: async () => {
      await redisSubClient.connect();
      return redisSubClient;
    },
  },
];
