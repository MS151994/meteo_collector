/// <reference types="jest" />

import 'reflect-metadata';

import {IMGWWarningModel} from '../../src/models/WarningModel';
import {WarningPayload} from '../../src/payloads/WarningPayload';
import {WarningsResponsePayload} from '../../src/payloads/WarningsResponsePayload';

const buildWarning = (overrides: Record<string, unknown> = {}): WarningPayload =>
  new WarningPayload(
    new IMGWWarningModel({
      id: '1',
      nazwa_zdarzenia: 'Burza',
      stopien: 2,
      prawdopodobienstwo: 70,
      obowiazuje_od: '2024-01-01T00:00:00Z',
      obowiazuje_do: '2024-01-01T01:00:00Z',
      opublikowano: '2024-01-01T00:00:00Z',
      tresc: 'Burza z gradem',
      komentarz: 'Uwaga',
      teryt: [1],
      ...overrides,
    }),
  );

const buildResponse = (warnings: WarningPayload[]): WarningsResponsePayload => {
  const response = new WarningsResponsePayload();
  return response.setWarnings(warnings).setLocation('Test').setEventsName('Burza');
};

const buildNotifier = async (redis: {get: jest.Mock; setNx: jest.Mock}, notify: jest.Mock) => {
  const {WarningNotifier} = await import('../../src/services/WarningNotifier');
  const {WarningSignatureHelper} = await import('../../src/helper/WarningSignatureHelper');
  const {WarningNotificationFactory} = await import('../../src/services/WarningNotificationFactory');

  const notifier = new WarningNotifier();
  (notifier as any).logger = {info: jest.fn(), warning: jest.fn(), error: jest.fn()};
  (notifier as any).redis = redis;
  (notifier as any).signatureHelper = new WarningSignatureHelper();
  (notifier as any).factory = new WarningNotificationFactory();
  (notifier as any).notificationService = {notify};
  return notifier;
};

describe('WarningNotifier', () => {
  it('notifies each unseen warning and marks it', async () => {
    jest.resetModules();
    const redis = {get: jest.fn().mockResolvedValue(null), setNx: jest.fn().mockResolvedValue(true)};
    const notify = jest.fn().mockResolvedValue(true);
    const notifier = await buildNotifier(redis, notify);

    const storm = buildWarning({tresc: 'Burza z gradem'});
    const heat = buildWarning({nazwa_zdarzenia: 'Upał', tresc: 'Upał do 35C', stopien: 3});
    await notifier.notifyNew(buildResponse([storm, heat]));

    expect(notify).toHaveBeenCalledTimes(2);
    expect(redis.setNx).toHaveBeenCalledTimes(2);
    const [, , ttl] = redis.setNx.mock.calls[0];
    expect(typeof ttl).toBe('number');
    expect(ttl).toBeGreaterThan(0);
  });

  it('skips a warning that was already notified', async () => {
    jest.resetModules();
    const redis = {get: jest.fn().mockResolvedValue('1'), setNx: jest.fn()};
    const notify = jest.fn();
    const notifier = await buildNotifier(redis, notify);

    await notifier.notifyNew(buildResponse([buildWarning()]));

    expect(notify).not.toHaveBeenCalled();
    expect(redis.setNx).not.toHaveBeenCalled();
  });

  it('does not mark when the send failed', async () => {
    jest.resetModules();
    const redis = {get: jest.fn().mockResolvedValue(null), setNx: jest.fn()};
    const notify = jest.fn().mockResolvedValue(false);
    const notifier = await buildNotifier(redis, notify);

    await notifier.notifyNew(buildResponse([buildWarning()]));

    expect(notify).toHaveBeenCalledTimes(1);
    expect(redis.setNx).not.toHaveBeenCalled();
  });
});
