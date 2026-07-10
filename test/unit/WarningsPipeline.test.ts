/// <reference types="jest" />

import 'reflect-metadata';

import {IMGWWarningModel} from '../../src/models/WarningModel';
import {WarningPayload} from '../../src/payloads/WarningPayload';
import {WarningsResponsePayload} from '../../src/payloads/WarningsResponsePayload';

const buildWarningsResponse = (): WarningsResponsePayload => {
  const model = new IMGWWarningModel({
    id: '1',
    nazwa_zdarzenia: 'Burza',
    stopien: 2,
    prawdopodobienstwo: 70,
    obowiazuje_od: '2024-01-01T00:00:00Z',
    obowiazuje_do: '2024-01-01T01:00:00Z',
    opublikowano: '2024-01-01T00:00:00Z',
    tresc: 'Test',
    komentarz: 'Uwaga',
    teryt: [1],
  });
  const response = new WarningsResponsePayload();
  return response
    .setWarnings([new WarningPayload(model)])
    .setLocation('Test')
    .setEventsName('Burza');
};

const buildPipeline = async (warnings: WarningsResponsePayload) => {
  const deps = {
    history: {record: jest.fn().mockResolvedValue(undefined)},
    notifier: {notifyNew: jest.fn().mockResolvedValue(undefined)},
  };

  const {WarningsPipeline} = await import('../../src/application/WarningsPipeline');
  const pipeline = new WarningsPipeline();
  (pipeline as any).logger = {info: jest.fn(), warning: jest.fn(), error: jest.fn()};
  (pipeline as any).weatherApplication = {getWarnings: jest.fn().mockResolvedValue(warnings)};
  (pipeline as any).haMqttService = {publishWarnings: jest.fn().mockResolvedValue(undefined)};
  (pipeline as any).history = deps.history;
  (pipeline as any).notifier = deps.notifier;

  return {pipeline, deps};
};

describe('WarningsPipeline', () => {
  it('records history and dispatches notifications for the fetched warnings', async () => {
    jest.resetModules();
    const warnings = buildWarningsResponse();
    const {pipeline, deps} = await buildPipeline(warnings);

    await pipeline.run();

    expect(deps.history.record).toHaveBeenCalledWith(warnings);
    expect(deps.notifier.notifyNew).toHaveBeenCalledWith(warnings);
  });

  it('does not throw when a downstream step fails', async () => {
    jest.resetModules();
    const {pipeline, deps} = await buildPipeline(buildWarningsResponse());
    deps.notifier.notifyNew.mockRejectedValue(new Error('boom'));

    await expect(pipeline.run()).resolves.toBeUndefined();
  });
});
