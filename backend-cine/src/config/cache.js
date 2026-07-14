import { createClient } from 'redis';

let redisClient = null;
let useRedis = false;

// Local in-memory store fallback
const memoryCache = new Map();
const memoryCacheExpiry = new Map();

if (process.env.REDIS_URL) {
  console.log('[Cache] Initializing Redis client...');
  redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
      connectTimeout: 5000,
      reconnectStrategy: (retries) => {
        if (retries > 3) {
          console.warn('[Cache] Redis reconnection limit reached. Falling back to memory cache.');
          useRedis = false;
          return new Error('Redis connection failed');
        }
        return 1000;
      }
    }
  });

  redisClient.on('error', (err) => {
    console.error('[Cache] Redis Client Error:', err.message);
    useRedis = false;
  });

  redisClient.on('connect', () => {
    console.log('[Cache] Connected to Redis successfully.');
    useRedis = true;
  });

  // Connect client asynchronously
  redisClient.connect().catch((err) => {
    console.warn('[Cache] Could not connect to Redis, using memory cache fallback:', err.message);
    useRedis = false;
  });
} else {
  console.log('[Cache] REDIS_URL not configured. Using in-memory cache fallback.');
}

export const cacheService = {
  get: async (key) => {
    if (useRedis && redisClient?.isOpen) {
      try {
        const val = await redisClient.get(key);
        if (val) {
          console.log(`[Cache] HIT key=${key} (Redis)`);
          return JSON.parse(val);
        }
      } catch (err) {
        console.error(`[Cache] Redis GET error for key ${key}:`, err.message);
      }
    }

    // In-memory fallback
    const val = memoryCache.get(key);
    if (val !== undefined) {
      const expiry = memoryCacheExpiry.get(key);
      if (expiry && expiry < Date.now()) {
        // Expired
        memoryCache.delete(key);
        memoryCacheExpiry.delete(key);
      } else {
        console.log(`[Cache] HIT key=${key} (Memory)`);
        return val;
      }
    }

    console.log(`[Cache] MISS key=${key}`);
    return null;
  },

  set: async (key, value, ttlSeconds = 300) => {
    if (useRedis && redisClient?.isOpen) {
      try {
        await redisClient.set(key, JSON.stringify(value), {
          EX: ttlSeconds
        });
        console.log(`[Cache] SET key=${key} TTL=${ttlSeconds}s (Redis)`);
        return;
      } catch (err) {
        console.error(`[Cache] Redis SET error for key ${key}:`, err.message);
      }
    }

    // In-memory fallback
    memoryCache.set(key, value);
    memoryCacheExpiry.set(key, Date.now() + (ttlSeconds * 1000));
    console.log(`[Cache] SET key=${key} TTL=${ttlSeconds}s (Memory)`);
  },

  delete: async (key) => {
    if (useRedis && redisClient?.isOpen) {
      try {
        await redisClient.del(key);
        console.log(`[Cache] DEL key=${key} (Redis)`);
      } catch (err) {
        console.error(`[Cache] Redis DEL error for key ${key}:`, err.message);
      }
    }

    // In-memory fallback
    memoryCache.delete(key);
    memoryCacheExpiry.delete(key);
    console.log(`[Cache] DEL key=${key} (Memory)`);
  },

  deletePrefix: async (prefix) => {
    if (useRedis && redisClient?.isOpen) {
      try {
        const keys = await redisClient.keys(`${prefix}*`);
        if (keys.length > 0) {
          await redisClient.del(keys);
          console.log(`[Cache] DEL prefix=${prefix} keysCount=${keys.length} (Redis)`);
        }
      } catch (err) {
        console.error(`[Cache] Redis DEL prefix error for ${prefix}:`, err.message);
      }
    }

    // In-memory fallback
    let deletedCount = 0;
    for (const key of memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        memoryCache.delete(key);
        memoryCacheExpiry.delete(key);
        deletedCount++;
      }
    }
    console.log(`[Cache] DEL prefix=${prefix} keysCount=${deletedCount} (Memory)`);
  },

  clear: async () => {
    if (useRedis && redisClient?.isOpen) {
      try {
        await redisClient.flushDb();
        console.log(`[Cache] FLUSH (Redis)`);
      } catch (err) {
        console.error(`[Cache] Redis FLUSH error:`, err.message);
      }
    }

    memoryCache.clear();
    memoryCacheExpiry.clear();
    console.log(`[Cache] FLUSH (Memory)`);
  }
};
