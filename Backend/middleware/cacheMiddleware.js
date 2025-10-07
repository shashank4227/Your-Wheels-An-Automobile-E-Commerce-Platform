// middleware/cacheMiddleware.js
const { getRedisClient, isTestEnvironment, isRedisReady } = require('../config/redis');

const safeRedisOperation = async (operation) => {
  try {
    if (!isRedisReady() && !isTestEnvironment()) {
      console.warn('Redis not ready - skipping cache operation');
      return null;
    }
    return await operation();
  } catch (err) {
    console.error('Redis operation failed:', err);
    return null;
  }
};
//cache

const cacheMiddleware = (ttl = 3600, keyGenerator) => {
  return async (req, res, next) => {
    if (isTestEnvironment()) return next();
    
    const cacheKey = typeof keyGenerator === 'function' 
      ? keyGenerator(req) 
      : req.originalUrl;

    // Try to get cached data
    const cachedData = await safeRedisOperation(async () => {
      const client = getRedisClient();
      return await client.get(cacheKey);
    });

    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    // Override response method to cache data
    const originalJson = res.json;
    res.json = async (body) => {
      if (!isTestEnvironment()) {
        await safeRedisOperation(async () => {
          const client = getRedisClient();
          await client.setEx(cacheKey, ttl, JSON.stringify(body));
        });
      }
      originalJson.call(res, body);
    };

    next();
  };
};

const clearCache = (patternGenerator) => {
  return async (req, res, next) => {
    if (isTestEnvironment()) return next();
    
    const pattern = typeof patternGenerator === 'function'
      ? patternGenerator(req)
      : patternGenerator;

    await safeRedisOperation(async () => {
      const client = getRedisClient();
      const keys = await client.keys(pattern);
      if (keys.length) {
        await client.del(keys);
      }
    });

    next();
  };
};

module.exports = {
  cacheMiddleware,
  clearCache
};