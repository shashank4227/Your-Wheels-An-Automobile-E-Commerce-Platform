// middleware/redisMiddleware.js
const { getRedisClient, isTestEnvironment } = require('../config/redis');

const cacheMiddleware = (keyGenerator, ttl = 3600) => {
  return async (req, res, next) => {
    if (isTestEnvironment()) return next();
    
    const redisClient = getRedisClient();
    const cacheKey = typeof keyGenerator === 'function' 
      ? keyGenerator(req) 
      : req.originalUrl;

    try {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

      const originalJson = res.json;
      res.json = (body) => {
        if (!isTestEnvironment()) {
          redisClient.setEx(cacheKey, ttl, JSON.stringify(body));
        }
        originalJson.call(res, body);
      };

      next();
    } catch (err) {
      console.error('Redis error:', err);
      next();
    }
  };
};

const invalidateCache = (patternGenerator) => {
  return async (req, res, next) => {
    if (isTestEnvironment()) return next();
    
    const redisClient = getRedisClient();
    const pattern = typeof patternGenerator === 'function'
      ? patternGenerator(req)
      : patternGenerator;

    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length) {
        await redisClient.del(keys);
      }
      next();
    } catch (err) {
      console.error('Cache invalidation error:', err);
      next();
    }
  };
};

module.exports = {
  cacheMiddleware,
  invalidateCache
};