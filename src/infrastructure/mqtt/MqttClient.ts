import mqtt, {IClientOptions, MqttClient as RawMqttClient} from 'mqtt';
import {inject, injectable} from 'inversify';
import Env from '../env/Env';
import {LoggerService} from '../logger/LoggerService';
import {TYPES} from '../ioc/Types';
import {mqttDeviceId} from './topics';

export type PublishOptions = {
  qos?: 0 | 1 | 2;
  retain?: boolean;
};

@injectable()
export class MqttClient {
  @inject(TYPES.LoggerService)
  private readonly logger: LoggerService;

  private client: RawMqttClient | null = null;
  private connecting: Promise<RawMqttClient> | null = null;
  private availabilityTopic: string | null = null;
  private subscriptions: Array<{topic: string; messageListener: (t: string, msg: Buffer) => void}> = [];

  private readonly prefix: string = '[MqttClient]';

  public isConnected(): boolean {
    return this.client?.connected ?? false;
  }

  public async start(availabilityTopic: string | null): Promise<void> {
    await this.ensureConnected(availabilityTopic);
  }

  public async subscribe(
    availabilityTopic: string | null,
    topic: string,
    handler: (payload: string) => void,
  ): Promise<void> {
    const client = await this.ensureConnected(availabilityTopic);

    const messageListener = (receivedTopic: string, message: Buffer): void => {
      if (receivedTopic === topic) {
        handler(message.toString());
      }
    };

    return new Promise<void>((resolve, reject) => {
      client.subscribe(topic, {qos: 0}, (err) => {
        if (err) {
          reject(err);
          return;
        }
        client.on('message', messageListener);
        this.subscriptions.push({topic, messageListener});
        resolve();
      });
    });
  }

  public async publish(
    availabilityTopic: string | null,
    topic: string,
    payload: string,
    options: PublishOptions = {},
  ): Promise<void> {
    const client = await this.ensureConnected(availabilityTopic);

    const publishOptions = {
      qos: (options.qos ?? 0) as 0 | 1 | 2,
      retain: options.retain ?? false,
    };

    return new Promise<void>((resolve, reject) => {
      client.publish(topic, payload, publishOptions, (err?: Error) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  private async ensureConnected(availabilityTopic: string | null): Promise<RawMqttClient> {
    if (!Env.MQTT_URL) {
      throw new Error('Missing MQTT_URL');
    }

    if (availabilityTopic && this.availabilityTopic && this.availabilityTopic !== availabilityTopic) {
      this.logger.warning(
        `${this.prefix} availability topic changed from ${this.availabilityTopic} to ${availabilityTopic}`,
      );
    }
    this.availabilityTopic = availabilityTopic;

    if (this.client?.connected) {
      return this.client;
    }

    if (this.client) {
      this.client.removeAllListeners();
      this.client.end(true);
      this.client = null;
    }

    if (this.connecting) {
      return this.connecting;
    }

    this.connecting = new Promise<RawMqttClient>((resolve, reject) => {
      const clientId = (Env.MQTT_CLIENT_ID || '').trim() || this.defaultClientId();

      const options: IClientOptions = {
        clientId,
        username: Env.MQTT_USERNAME || undefined,
        password: Env.MQTT_PASSWORD || undefined,
        keepalive: 60,
        reconnectPeriod: 0,
        connectTimeout: 10_000,
        clean: true,
      };

      if (availabilityTopic) {
        options.will = {
          topic: availabilityTopic,
          payload: 'offline',
          qos: this.qos(),
          retain: false,
        };
      }

      const client = mqtt.connect(Env.MQTT_URL, options);
      this.client = client;

      const settle = (fn: () => void) => {
        client.off('connect', onConnect);
        client.off('close', onClose);
        client.off('offline', onOffline);
        client.off('end', onEnd);
        client.off('error', onError);
        clearTimeout(timeout);
        fn();
      };

      const onConnect = () => {
        this.logger.info(`${this.prefix} connected (clientId=${clientId})`);
        if (availabilityTopic) {
          void this.publishOnline(client, availabilityTopic);
        }

        for (const sub of this.subscriptions) {
          client.subscribe(sub.topic, {qos: 0});
          client.on('message', sub.messageListener);
        }

        settle(() => resolve(client));

        client.once('close', () => {
          this.logger.warning(`${this.prefix} connection lost, will reconnect on next publish`);
          for (const sub of this.subscriptions) {
            client.off('message', sub.messageListener);
          }
          this.client = null;
          this.connecting = null;
        });
      };

      const onClose = () => {
        this.logger.warning(`${this.prefix} connection closed (clientId=${clientId})`);
        if (!client.connected) {
          settle(() => reject(new Error('MQTT connection closed before connect (check URL/port/TLS/auth/clientId)')));
        }
      };

      const onOffline = () => {
        this.logger.warning(`${this.prefix} offline (clientId=${clientId})`);
      };

      const onEnd = () => {
        this.logger.warning(`${this.prefix} ended (clientId=${clientId})`);
        if (!client.connected) {
          settle(() => reject(new Error('MQTT connection ended before connect')));
        }
      };

      const onError = (err: Error) => {
        this.logger.error(`${this.prefix} error (clientId=${clientId}): ${err.message}`);
        if (!client.connected) {
          settle(() => reject(err));
        }
      };

      const timeout = setTimeout(() => {
        if (client.connected) {
          return;
        }
        this.logger.error(`${this.prefix} connect timeout (clientId=${clientId})`);
        try {
          client.end(true);
        } catch {
          // ignore
        }
        settle(() => reject(new Error('MQTT connect timeout (check URL/port/TLS/auth)')));
      }, 12_000);

      client.on('connect', onConnect);
      client.on('close', onClose);
      client.on('offline', onOffline);
      client.on('end', onEnd);
      client.on('error', onError);
    }).finally(() => {
      this.connecting = null;
    });

    return this.connecting;
  }

  private qos(): 0 | 1 | 2 {
    const qos = Env.MQTT_QOS;
    if (qos === 1 || qos === 2) {
      return qos;
    }
    return 0;
  }

  private defaultClientId(): string {
    const deviceId = mqttDeviceId().replace(/\s+/g, '_');
    return `${deviceId}_${Math.random().toString(16).slice(2)}`;
  }

  private publishOnline(client: RawMqttClient, availabilityTopic: string): Promise<void> {
    return new Promise<void>((resolve) => {
      client.publish(availabilityTopic, 'online', {retain: true, qos: this.qos()}, () => resolve());
    });
  }
}
