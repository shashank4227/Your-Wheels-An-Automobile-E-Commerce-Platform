// config/redis.js
const redis = require("redis");
require("dotenv").config();

let redisClient;
let isTestMode = false;
let isInitialized = false;

const initializeRedis = async (options = {}) => {
  if (isInitialized) return redisClient;

  isTestMode = options.testMode || process.env.NODE_ENV === 'test';

  if (isTestMode) {
    redisClient = {
      get: async () => null,
      setEx: async () => {},
      del: async () => {},
      keys: async () => [],
      quit: async () => {},
      isMock: true
    };
    isInitialized = true;
    return redisClient;
  }

  redisClient = redis.createClient({
    socket: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      tls: true,
    },
    username: process.env.REDIS_USER,
    password: process.env.REDIS_PASS,
  });

  redisClient.on("connect", () => {
    console.log("✅ Redis connected successfully");
    isInitialized = true;
  });

  redisClient.on("error", (err) => {
    console.error("❌ Redis Client Error:", err);
    isInitialized = false;
  });

  try {
    await redisClient.connect();
    return redisClient;
  } catch (err) {
    console.error("❌ Redis connection failed:", err);
    isInitialized = false;
    throw err;
  }
};

const getRedisClient = () => {
  if (!isInitialized) {
    console.warn("⚠️ Redis client accessed before initialization");
    return {
      get: async () => null,
      setEx: async () => {},
      del: async () => {},
      keys: async () => [],
      isMock: true
    };
  }
  return redisClient;
};

const isTestEnvironment = () => isTestMode;

const isRedisReady = () => isInitialized;

module.exports = {
  initializeRedis,
  getRedisClient,
  isTestEnvironment,
  isRedisReady
};