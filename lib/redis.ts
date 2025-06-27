import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

function getRedis() {
  if (!globalForRedis.redis) {
    globalForRedis.redis = new Redis(
      process.env.REDIS_URL || "redis://localhost:6379",
      {
        maxRetriesPerRequest: null, // Required for BullMQ compatibility
      }
    );
  }
  return globalForRedis.redis;
}

// Export the Redis client directly
export const redis = getRedis();

export default redis;
