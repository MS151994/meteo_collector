import {Get, HttpCode, JsonController} from 'routing-controllers';
import {inject, injectable} from 'inversify';
import {TYPES} from '../infrastructure/ioc/Types';
import {MqttClient} from '../infrastructure/mqtt/MqttClient';
import {RedisClient} from '../infrastructure/redis/RedisClient';
import Env from '../infrastructure/env/Env';

interface HealthResponse {
  status: 'ok' | 'degraded';
  uptime: number;
  mqtt: 'connected' | 'disconnected';
  territory: string;
  redis: 'connected' | 'disconnected' | 'disabled';
  history: boolean;
}

interface AliveResponse {
  status: 'ok';
  uptime: number;
}

@injectable()
@JsonController('/health')
export class HealthController {
  @inject(TYPES.MqttClient)
  private mqttClient: MqttClient;

  @inject(TYPES.RedisClient)
  private redisClient: RedisClient;

  @Get('/alive')
  @HttpCode(200)
  public getAlive(): AliveResponse {
    return {
      status: 'ok',
      uptime: Math.floor(process.uptime()),
    };
  }

  @Get('/')
  @HttpCode(200)
  public async getHealth(): Promise<HealthResponse> {
    const mqttConnected = this.mqttClient.isConnected();
    const redisConnected = Env.REDIS_URL ? await this.redisClient.isConnected() : false;
    const redisDegraded = Boolean(Env.REDIS_URL) && !redisConnected;

    return {
      status: mqttConnected && !redisDegraded ? 'ok' : 'degraded',
      uptime: Math.floor(process.uptime()),
      mqtt: mqttConnected ? 'connected' : 'disconnected',
      territory: Env.WARNINGS_TERRITORY,
      redis: !Env.REDIS_URL ? 'disabled' : redisConnected ? 'connected' : 'disconnected',
      history: Env.ENABLE_HISTORY,
    };
  }
}
