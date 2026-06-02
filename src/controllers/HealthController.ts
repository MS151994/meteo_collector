import {Get, HttpCode, JsonController} from 'routing-controllers';
import {inject, injectable} from 'inversify';
import {TYPES} from '../infrastructure/ioc/Types';
import {MqttClient} from '../infrastructure/mqtt/MqttClient';

interface HealthResponse {
  status: 'ok' | 'degraded';
  uptime: number;
  mqtt: 'connected' | 'disconnected';
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
  public getHealth(): HealthResponse {
    const mqttConnected = this.mqttClient.isConnected();

    return {
      status: mqttConnected ? 'ok' : 'degraded',
      uptime: Math.floor(process.uptime()),
      mqtt: mqttConnected ? 'connected' : 'disconnected',
    };
  }
}
