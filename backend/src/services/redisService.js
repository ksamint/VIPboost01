import { createClient } from 'redis';
import { config } from '../config/index.js';

let redisClient;

export async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      socket: {
        host: config.redis.host,
        port: config.redis.port,
      },
      password: config.redis.password,
    });

    redisClient.on('error', (err) => console.error('Redis Client Error:', err));
    redisClient.on('connect', () => console.log('Redis connected'));

    await redisClient.connect();
  }

  return redisClient;
}

export async function setWithExpiry(key, value, ttlSeconds = 3600) {
  const client = await getRedisClient();
  await client.setEx(key, ttlSeconds, JSON.stringify(value));
}

export async function getValue(key) {
  const client = await getRedisClient();
  const value = await client.get(key);
  return value ? JSON.parse(value) : null;
}

export async function deleteKey(key) {
  const client = await getRedisClient();
  await client.del(key);
}

export async function incrementCounter(key) {
  const client = await getRedisClient();
  return await client.incr(key);
}

export async function cacheUserSession(userId, sessionData, ttlSeconds = 86400) {
  await setWithExpiry(`session:${userId}`, sessionData, ttlSeconds);
}

export async function getUserSession(userId) {
  return await getValue(`session:${userId}`);
}

export async function invalidateUserSession(userId) {
  await deleteKey(`session:${userId}`);
}

export async function rateLimitUser(userId, action, maxAttempts, windowSeconds) {
  const key = `ratelimit:${action}:${userId}`;
  const client = await getRedisClient();

  const current = await client.get(key);

  if (current && parseInt(current) >= maxAttempts) {
    const ttl = await client.ttl(key);
    return {
      limited: true,
      remaining: 0,
      resetIn: ttl,
    };
  }

  if (current) {
    await client.incr(key);
    return {
      limited: false,
      remaining: maxAttempts - parseInt(current) - 1,
      resetIn: windowSeconds,
    };
  }

  await client.setEx(key, windowSeconds, '1');
  return {
    limited: false,
    remaining: maxAttempts - 1,
    resetIn: windowSeconds,
  };
}
