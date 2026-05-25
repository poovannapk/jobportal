import { Redis } from "ioredis";
import type { CacheStore } from "./ports.js";

export class RedisCacheStore implements CacheStore {
  constructor(private readonly redis: Redis) {}

  async deletePattern(pattern: string): Promise<number> {
    let cursor = "0";
    let deleted = 0;

    do {
      const [nextCursor, keys] = await this.redis.scan(cursor, "MATCH", pattern, "COUNT", 250);
      cursor = nextCursor;
      if (keys.length > 0) {
        deleted += await this.redis.del(...keys);
      }
    } while (cursor !== "0");

    return deleted;
  }

  async increment(key: string): Promise<number> {
    return this.redis.incr(key);
  }

  async setJson(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? (JSON.parse(value) as T) : null;
  }
}

export class InMemoryCacheStore implements CacheStore {
  private readonly values = new Map<string, { value: unknown; expiresAt: number }>();

  async deletePattern(pattern: string): Promise<number> {
    const regex = new RegExp(`^${pattern.replace(/\*/g, ".*")}$`);
    let deleted = 0;
    for (const key of this.values.keys()) {
      if (regex.test(key)) {
        this.values.delete(key);
        deleted += 1;
      }
    }
    return deleted;
  }

  async increment(key: string): Promise<number> {
    const current = Number((await this.getJson<number>(key)) ?? 0) + 1;
    await this.setJson(key, current, 86_400);
    return current;
  }

  async setJson(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    this.values.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  async getJson<T>(key: string): Promise<T | null> {
    const record = this.values.get(key);
    if (!record) return null;
    if (record.expiresAt < Date.now()) {
      this.values.delete(key);
      return null;
    }
    return record.value as T;
  }
}
