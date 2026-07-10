import Redis from 'ioredis';
import {inject, injectable} from 'inversify';
import Env from '../env/Env';
import {LoggerService} from '../logger/LoggerService';
import {TYPES} from '../ioc/Types';

@injectable()
export class RedisClient {
  @inject(TYPES.LoggerService)
  private readonly logger: LoggerService;

  private client: Redis | null = null;
  private readonly prefix: string = '[RedisClient]';

  public async get(key: string): Promise<string | null> {
    const client = this.getClient();
    if (!client) {
      return null;
    }
    return client.get(key);
  }

  public async set(key: string, value: string): Promise<void> {
    const client = this.getClient();
    if (!client) {
      return;
    }
    await client.set(key, value);
  }

  public async setNx(key: string, value: string, ttlSeconds: number): Promise<boolean> {
    const client = this.getClient();
    if (!client) {
      return false;
    }

    const result = await client.set(key, value, 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  }

  public async scanValues(pattern: string): Promise<string[]> {
    const client = this.getClient();
    if (!client) {
      return [];
    }

    const keys: string[] = [];
    let cursor = '0';
    do {
      const [next, batch] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      keys.push(...batch);
      cursor = next;
    } while (cursor !== '0');

    if (!keys.length) {
      return [];
    }

    const values = await client.mget(keys);
    return values.filter((value): value is string => value !== null);
  }

  private getClient(): Redis | null {
    if (!Env.REDIS_URL) {
      return null;
    }

    if (!this.client) {
      this.client = new Redis(Env.REDIS_URL, {
        maxRetriesPerRequest: 2,
        ...(Env.REDIS_USERNAME ? {username: Env.REDIS_USERNAME} : {}),
        ...(Env.REDIS_PASSWORD ? {password: Env.REDIS_PASSWORD} : {}),
      });
      this.client.on('error', (err: Error) => this.logger.warning(`${this.prefix} ${err.message}`));
    }

    return this.client;
  }
}
