import { createClient } from 'redis';

export const redisPubClient = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});
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
