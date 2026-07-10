/// <reference types="jest" />

import 'reflect-metadata';

import {WarningsResponsePayload} from '../../src/payloads/WarningsResponsePayload';

const buildWarningsResponse = (): WarningsResponsePayload => {
  const response = new WarningsResponsePayload();
  response.setWarnings([]).setLocation('Test').setEventsName('Burza').setEstimatedEndTime('soon');
  return response;
};

const makeLogger = () => ({info: jest.fn(), warning: jest.fn(), error: jest.fn(), debug: jest.fn()});

const makeMqttClient = () => ({
  start: jest.fn().mockResolvedValue(undefined),
  subscribe: jest.fn().mockResolvedValue(undefined),
  publish: jest.fn().mockResolvedValue(undefined),
});

describe('HomeAssistantMqttService', () => {
  beforeEach(() => {
    process.env.ENABLE_HA_MQTT = 'true';
    process.env.MQTT_URL = 'mqtt://localhost:1883';
    process.env.HA_MQTT_ENABLE_AVAILABILITY = 'true';
    process.env.HA_MQTT_DISCOVERY_PREFIX = 'homeassistant';
    process.env.MQTT_BASE_TOPIC = 'meteocollector';
    process.env.HA_MQTT_DEVICE_ID = 'meteocollector';
    process.env.MQTT_QOS = '0';
    process.env.HA_MQTT_SENSOR_NAME = 'meteo_collector';
    process.env.HA_MQTT_DEVICE_NAME = 'Meteo Collector';
    process.env.HA_MQTT_DEVICE_MANUFACTURER = 'MeteoCollector';
    process.env.HA_MQTT_DEVICE_MODEL = 'IMGW Meteo Warnings';
    process.env.WARNINGS_TERRITORY = 'zdunskowolski';
    process.env.WARNINGS_CRON_SCHEDULE = '*/5 * * * *';
  });

  it('start does nothing when ENABLE_HA_MQTT is false', async () => {
    jest.resetModules();
    process.env.ENABLE_HA_MQTT = 'false';

    const {HomeAssistantMqttService} = await import('../../src/infrastructure/mqtt/HomeAssistantMqttService');
    const service = new HomeAssistantMqttService();
    const mqtt = makeMqttClient();
    (service as any).mqttClient = mqtt;
    (service as any).logger = makeLogger();

    await service.start();

    expect(mqtt.start).not.toHaveBeenCalled();
    expect(mqtt.subscribe).not.toHaveBeenCalled();
  });

  it('start connects and subscribes to HA birth topic', async () => {
    jest.resetModules();

    const {HomeAssistantMqttService} = await import('../../src/infrastructure/mqtt/HomeAssistantMqttService');
    const service = new HomeAssistantMqttService();
    const mqtt = makeMqttClient();
    (service as any).mqttClient = mqtt;
    (service as any).logger = makeLogger();

    await service.start();

    expect(mqtt.start).toHaveBeenCalledTimes(1);
    expect(mqtt.subscribe).toHaveBeenCalledWith(expect.anything(), 'homeassistant/status', expect.any(Function));
  });

  it('start logs warning when subscribe to birth topic fails', async () => {
    jest.resetModules();

    const {HomeAssistantMqttService} = await import('../../src/infrastructure/mqtt/HomeAssistantMqttService');
    const service = new HomeAssistantMqttService();
    const logger = makeLogger();
    const mqtt = makeMqttClient();
    mqtt.subscribe.mockRejectedValue(new Error('connection refused'));
    (service as any).mqttClient = mqtt;
    (service as any).logger = logger;

    await service.start();

    expect(logger.warning).toHaveBeenCalledWith(expect.stringContaining('failed to subscribe to birth topic'));
  });

  it('publishWarnings does nothing when ENABLE_HA_MQTT is false', async () => {
    jest.resetModules();
    process.env.ENABLE_HA_MQTT = 'false';

    const {HomeAssistantMqttService} = await import('../../src/infrastructure/mqtt/HomeAssistantMqttService');
    const service = new HomeAssistantMqttService();
    const mqtt = makeMqttClient();
    (service as any).mqttClient = mqtt;
    (service as any).logger = makeLogger();

    await service.publishWarnings(buildWarningsResponse());

    expect(mqtt.publish).not.toHaveBeenCalled();
  });

  it('publishWarnings logs warning when MQTT_URL is missing', async () => {
    jest.resetModules();
    process.env.MQTT_URL = '';

    const {HomeAssistantMqttService} = await import('../../src/infrastructure/mqtt/HomeAssistantMqttService');
    const service = new HomeAssistantMqttService();
    const logger = makeLogger();
    const mqtt = makeMqttClient();
    (service as any).mqttClient = mqtt;
    (service as any).logger = logger;

    await service.publishWarnings(buildWarningsResponse());

    expect(mqtt.publish).not.toHaveBeenCalled();
    expect(logger.warning).toHaveBeenCalledWith(expect.stringContaining('publish skipped'));
  });

  it('publishWarnings publishes discovery and state on first call', async () => {
    jest.resetModules();

    const {HomeAssistantMqttService} = await import('../../src/infrastructure/mqtt/HomeAssistantMqttService');
    const service = new HomeAssistantMqttService();
    const mqtt = makeMqttClient();
    (service as any).mqttClient = mqtt;
    (service as any).logger = makeLogger();

    await service.publishWarnings(buildWarningsResponse());

    expect(mqtt.publish).toHaveBeenCalledTimes(2);
    const [firstCall, secondCall] = mqtt.publish.mock.calls;
    expect(firstCall[1]).toContain('homeassistant/sensor');
    expect(secondCall[1]).toContain('warnings');
  });

  it('publishWarnings skips discovery on second call', async () => {
    jest.resetModules();

    const {HomeAssistantMqttService} = await import('../../src/infrastructure/mqtt/HomeAssistantMqttService');
    const service = new HomeAssistantMqttService();
    const mqtt = makeMqttClient();
    (service as any).mqttClient = mqtt;
    (service as any).logger = makeLogger();

    await service.publishWarnings(buildWarningsResponse());
    mqtt.publish.mockClear();
    await service.publishWarnings(buildWarningsResponse());

    expect(mqtt.publish).toHaveBeenCalledTimes(1);
    expect(mqtt.publish.mock.calls[0][1]).toContain('warnings');
  });

  it('discovery payload includes availability fields when HA_MQTT_ENABLE_AVAILABILITY is true', async () => {
    jest.resetModules();
    process.env.HA_MQTT_ENABLE_AVAILABILITY = 'true';

    const {HomeAssistantMqttService} = await import('../../src/infrastructure/mqtt/HomeAssistantMqttService');
    const service = new HomeAssistantMqttService();
    const mqtt = makeMqttClient();
    (service as any).mqttClient = mqtt;
    (service as any).logger = makeLogger();

    await service.publishWarnings(buildWarningsResponse());

    const discoveryPayload = JSON.parse(mqtt.publish.mock.calls[0][2]);
    expect(discoveryPayload).toHaveProperty('availability_topic');
    expect(discoveryPayload.payload_available).toBe('online');
    expect(discoveryPayload.payload_not_available).toBe('offline');
  });

  it('discovery payload excludes availability fields when HA_MQTT_ENABLE_AVAILABILITY is false', async () => {
    jest.resetModules();
    process.env.HA_MQTT_ENABLE_AVAILABILITY = 'false';

    const {HomeAssistantMqttService} = await import('../../src/infrastructure/mqtt/HomeAssistantMqttService');
    const service = new HomeAssistantMqttService();
    const mqtt = makeMqttClient();
    (service as any).mqttClient = mqtt;
    (service as any).logger = makeLogger();

    await service.publishWarnings(buildWarningsResponse());

    const discoveryPayload = JSON.parse(mqtt.publish.mock.calls[0][2]);
    expect(discoveryPayload).not.toHaveProperty('availability_topic');
  });

  it('HA birth "online" resets discovery and re-publishes last warnings', async () => {
    jest.resetModules();

    const {HomeAssistantMqttService} = await import('../../src/infrastructure/mqtt/HomeAssistantMqttService');
    const service = new HomeAssistantMqttService();
    const mqtt = makeMqttClient();
    (service as any).mqttClient = mqtt;
    (service as any).logger = makeLogger();

    let capturedBirthHandler: ((payload: string) => void) | undefined;
    mqtt.subscribe.mockImplementation((_avail: unknown, _topic: unknown, handler: (p: string) => void) => {
      capturedBirthHandler = handler;
      return Promise.resolve();
    });

    const warnings = buildWarningsResponse();
    await service.publishWarnings(warnings);

    await service.start();

    mqtt.publish.mockClear();

    capturedBirthHandler!('online');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mqtt.publish).toHaveBeenCalledTimes(2);
  });

  it('HA birth "online" does not re-publish when no previous warnings', async () => {
    jest.resetModules();

    const {HomeAssistantMqttService} = await import('../../src/infrastructure/mqtt/HomeAssistantMqttService');
    const service = new HomeAssistantMqttService();
    const mqtt = makeMqttClient();
    (service as any).mqttClient = mqtt;
    (service as any).logger = makeLogger();

    let capturedBirthHandler: ((payload: string) => void) | undefined;
    mqtt.subscribe.mockImplementation((_avail: unknown, _topic: unknown, handler: (p: string) => void) => {
      capturedBirthHandler = handler;
      return Promise.resolve();
    });

    await service.start();
    mqtt.publish.mockClear();

    capturedBirthHandler!('online');
    await new Promise(process.nextTick);

    expect(mqtt.publish).not.toHaveBeenCalled();
  });

  it('HA birth with payload other than "online" does nothing', async () => {
    jest.resetModules();

    const {HomeAssistantMqttService} = await import('../../src/infrastructure/mqtt/HomeAssistantMqttService');
    const service = new HomeAssistantMqttService();
    const mqtt = makeMqttClient();
    (service as any).mqttClient = mqtt;
    (service as any).logger = makeLogger();

    let capturedBirthHandler: ((payload: string) => void) | undefined;
    mqtt.subscribe.mockImplementation((_avail: unknown, _topic: unknown, handler: (p: string) => void) => {
      capturedBirthHandler = handler;
      return Promise.resolve();
    });

    await service.publishWarnings(buildWarningsResponse());
    await service.start();
    mqtt.publish.mockClear();

    capturedBirthHandler!('offline');
    await new Promise(process.nextTick);

    expect(mqtt.publish).not.toHaveBeenCalled();
  });

  it('state payload is published with retain true', async () => {
    jest.resetModules();

    const {HomeAssistantMqttService} = await import('../../src/infrastructure/mqtt/HomeAssistantMqttService');
    const service = new HomeAssistantMqttService();
    const mqtt = makeMqttClient();
    (service as any).mqttClient = mqtt;
    (service as any).logger = makeLogger();

    await service.publishWarnings(buildWarningsResponse());

    const stateCall = mqtt.publish.mock.calls[1];
    expect(stateCall[3]).toMatchObject({retain: true});
  });
});
