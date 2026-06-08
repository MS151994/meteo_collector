import {inject, injectable} from 'inversify';
import Env from '../infrastructure/env/Env';
import {LoggerService} from '../infrastructure/logger/LoggerService';
import {TYPES} from '../infrastructure/ioc/Types';
import {WarningsResponsePayload} from '../payloads/WarningsResponsePayload';
import * as pack from '../../package.json';
import {MqttClient} from '../infrastructure/mqtt/MqttClient';
import {
  haDiscoveryTopic,
  mqttDeviceId,
  mqttStatusTopic,
  mqttUniqueId,
  mqttWarningsTopic,
} from '../infrastructure/mqtt/topics';

@injectable()
export class HomeAssistantMqttService {
  @inject(TYPES.LoggerService)
  private readonly logger: LoggerService;

  @inject(TYPES.MqttClient)
  private readonly mqttClient: MqttClient;

  private discoveryPublished: boolean = false;
  private lastWarnings: WarningsResponsePayload | null = null;

  private readonly prefix: string = '[HomeAssistant MQTT]';

  public async start(): Promise<void> {
    if (!Env.ENABLE_HA_MQTT) {
      return;
    }

    await this.mqttClient.start(this.availabilityTopic());
    await this.subscribeToHaBirth();
  }

  private async subscribeToHaBirth(): Promise<void> {
    const birthTopic = `${Env.HA_MQTT_DISCOVERY_PREFIX}/status`;
    try {
      await this.mqttClient.subscribe(this.availabilityTopic(), birthTopic, (payload) => {
        if (payload !== 'online') {
          return;
        }
        this.logger.info(`${this.prefix} HA birth detected, re-announcing discovery and state`);
        this.discoveryPublished = false;
        if (this.lastWarnings) {
          void this.publishWarnings(this.lastWarnings).catch((err: unknown) => {
            this.logger.error(`${this.prefix} re-announce error: ${err instanceof Error ? err.message : String(err)}`);
          });
        }
      });
      this.logger.info(`${this.prefix} subscribed to HA birth topic: ${birthTopic}`);
    } catch (err) {
      this.logger.warning(
        `${this.prefix} failed to subscribe to birth topic: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  public async publishWarnings(warnings: WarningsResponsePayload): Promise<void> {
    if (!Env.ENABLE_HA_MQTT) {
      return;
    }
    if (!Env.MQTT_URL) {
      this.logger.warning(`${this.prefix} publish skipped: missing MQTT_URL`);
      return;
    }

    this.lastWarnings = warnings;
    await this.publishDiscovery();

    const payload = JSON.stringify(JSON.parse(JSON.stringify(warnings)));
    this.logger.debug(
      `${this.prefix} publish warnings topic=${mqttWarningsTopic()} bytes=${Buffer.byteLength(payload, 'utf8')}`,
    );
    await this.mqttClient.publish(this.availabilityTopic(), mqttWarningsTopic(), payload, {
      retain: true,
      qos: this.qos(),
    });
  }

  private async publishDiscovery(): Promise<void> {
    if (this.discoveryPublished) {
      return;
    }

    const uniqueId = mqttUniqueId();

    const configPayload = {
      name: Env.HA_MQTT_SENSOR_NAME,
      unique_id: uniqueId,
      state_topic: mqttWarningsTopic(),
      value_template: '{{ value_json.phenomenonName }}',
      json_attributes_topic: mqttWarningsTopic(),
      icon: 'mdi:weather-cloudy-alert',
      device: {
        identifiers: [mqttDeviceId()],
        name: Env.HA_MQTT_DEVICE_NAME,
        manufacturer: Env.HA_MQTT_DEVICE_MANUFACTURER,
        model: Env.HA_MQTT_DEVICE_MODEL,
        sw_version: `v${(pack as any).version ?? ''}`,
      },
    };

    if (Env.HA_MQTT_ENABLE_AVAILABILITY) {
      (configPayload as any).availability_topic = mqttStatusTopic();
      (configPayload as any).payload_available = 'online';
      (configPayload as any).payload_not_available = 'offline';
    }

    await this.mqttClient.publish(this.availabilityTopic(), haDiscoveryTopic(uniqueId), JSON.stringify(configPayload), {
      retain: true,
      qos: this.qos(),
    });

    this.discoveryPublished = true;
    this.logger.info(
      `${this.prefix} discovery published for unique_id=${uniqueId} topic=${haDiscoveryTopic(uniqueId)}`,
    );
  }

  private qos(): 0 | 1 | 2 {
    const qos = Env.MQTT_QOS;
    if (qos === 1 || qos === 2) {
      return qos;
    }
    return 0;
  }

  private availabilityTopic(): string | null {
    if (!Env.HA_MQTT_ENABLE_AVAILABILITY) {
      return null;
    }

    return mqttStatusTopic();
  }
}
