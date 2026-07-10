/// <reference types="jest" />

import 'reflect-metadata';

import {IMGWWarningModel} from '../../src/models/WarningModel';
import {WarningPayload} from '../../src/payloads/WarningPayload';
import {WarningsResponsePayload} from '../../src/payloads/WarningsResponsePayload';

const buildWarning = (overrides: Record<string, unknown> = {}): WarningPayload => {
  const model = new IMGWWarningModel({
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
  });
  return new WarningPayload(model);
};

const buildResponse = (warnings: WarningPayload[]): WarningsResponsePayload => {
  const response = new WarningsResponsePayload();
  return response.setWarnings(warnings).setLocation('Test').setEventsName('Burza');
};

const buildRedisStub = () => ({
  setNx: jest.fn().mockResolvedValue(true),
  scanValues: jest.fn().mockResolvedValue([]),
});

const buildService = async (redis: ReturnType<typeof buildRedisStub>) => {
  const {WarningsHistoryService} = await import('../../src/services/WarningsHistoryService');
  const service = new WarningsHistoryService();
  (service as any).logger = {info: jest.fn(), warning: jest.fn(), error: jest.fn()};
  (service as any).redis = redis;
  return service;
};

describe('WarningsHistoryService', () => {
  it('does not record when history is disabled', async () => {
    jest.resetModules();
    process.env.ENABLE_HISTORY = 'false';

    const redis = buildRedisStub();
    const service = await buildService(redis);

    await service.record(buildResponse([buildWarning()]));

    expect(redis.setNx).not.toHaveBeenCalled();
  });

  it('writes one entry per warning under distinct keys', async () => {
    jest.resetModules();
    process.env.ENABLE_HISTORY = 'true';
    process.env.HISTORY_RETENTION_DAYS = '7';

    const redis = buildRedisStub();
    const service = await buildService(redis);

    const storm = buildWarning({nazwa_zdarzenia: 'Burza', tresc: 'Burza z gradem', stopien: 2});
    const heat = buildWarning({nazwa_zdarzenia: 'Upał', tresc: 'Upał do 35C', stopien: 3});
    await service.record(buildResponse([storm, heat]));

    expect(redis.setNx).toHaveBeenCalledTimes(2);
    const [keyA] = redis.setNx.mock.calls[0];
    const [keyB, valueB, ttlB] = redis.setNx.mock.calls[1];
    expect(keyA).not.toBe(keyB);
    expect(ttlB).toBe(7 * 86_400);

    const entry = JSON.parse(valueB);
    expect(entry.eventName).toBe('Upał');
    expect(entry.level).toBe(3);
    expect(entry.warnings).toBeUndefined();
  });

  it('dedups by content+level+probability, ignoring comment and dates', async () => {
    jest.resetModules();
    process.env.ENABLE_HISTORY = 'true';

    const redis = buildRedisStub();
    const service = await buildService(redis);

    const original = buildWarning({komentarz: '', obowiazuje_do: '2024-01-01T01:00:00Z'});
    const edited = buildWarning({komentarz: 'dopisany komentarz', obowiazuje_do: '2024-01-01T05:00:00Z'});
    await service.record(buildResponse([original]));
    await service.record(buildResponse([edited]));

    const [keyFirst] = redis.setNx.mock.calls[0];
    const [keySecond] = redis.setNx.mock.calls[1];
    expect(keyFirst).toBe(keySecond);
  });

  it('parses and sorts stored entries on read', async () => {
    jest.resetModules();
    process.env.ENABLE_HISTORY = 'true';

    const redis = buildRedisStub();
    redis.scanValues.mockResolvedValue([
      JSON.stringify({recordedAt: '2024-01-02T00:00:00Z', eventName: 'Upał'}),
      JSON.stringify({recordedAt: '2024-01-01T00:00:00Z', eventName: 'Burza'}),
    ]);
    const service = await buildService(redis);

    const result = await service.getHistory();

    expect(result).toHaveLength(2);
    expect(result[0].eventName).toBe('Burza');
    expect(result[1].eventName).toBe('Upał');
  });
});
