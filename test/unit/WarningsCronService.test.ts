/// <reference types="jest" />

import 'reflect-metadata';

jest.mock('node-cron', () => ({
  schedule: jest.fn(),
}));

jest.mock('got', () => {
  const got = jest.fn();
  return {
    __esModule: true,
    default: got,
  };
});

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn(),
  },
}));

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

  const warning = new WarningPayload(model);
  const response = new WarningsResponsePayload();

  response.setWarnings([warning]).setLocation('Test').setEventsName('Burza').setEstimatedEndTime('soon');

  return response;
};

const buildEmptyWarningsResponse = (): WarningsResponsePayload => {
  const response = new WarningsResponsePayload();
  response.setWarnings([]).setLocation('Test').setEventsName('No warnings').setEstimatedEndTime('n/a');
  return response;
};

describe('WarningsCronService', () => {
  beforeEach(() => {
    process.env.WARNINGS_CRON_SCHEDULE = '*/5 * * * *';
    process.env.USER = 'user';
    process.env.PASSWORD = 'pass';
  });

  it('schedules cron using env schedule', async () => {
    jest.resetModules();

    const cron = await import('node-cron');
    const schedule = cron.schedule as unknown as jest.Mock;
    const fs = await import('fs');
    const readFile = fs.promises.readFile as unknown as jest.Mock;
    readFile.mockRejectedValue({code: 'ENOENT'});

    const {WarningsCronService} = await import('../../src/services/WarningsCronService');

    const service = new WarningsCronService();
    (service as any).logger = {info: jest.fn(), warn: jest.fn(), error: jest.fn()};
    (service as any).weatherApplication = {getWarnings: jest.fn().mockResolvedValue(buildEmptyWarningsResponse())};
    (service as any).httpClient = {execute: jest.fn()};

    service.start();

    expect(schedule).toHaveBeenCalledWith('*/5 * * * *', expect.any(Function));
  });

  it('persists signature and skips sending when warnings are empty', async () => {
    jest.resetModules();

    const fs = await import('fs');
    const mkdir = fs.promises.mkdir as unknown as jest.Mock;
    const writeFile = fs.promises.writeFile as unknown as jest.Mock;

    const {WarningsCronService} = await import('../../src/services/WarningsCronService');

    const service = new WarningsCronService();
    (service as any).logger = {info: jest.fn(), warn: jest.fn(), error: jest.fn()};
    (service as any).weatherApplication = {getWarnings: jest.fn()};
    const execute = jest.fn();
    (service as any).httpClient = {execute};

    await (service as any).processWarnings(buildEmptyWarningsResponse(), false);

    expect(execute).not.toHaveBeenCalled();
    expect(mkdir).toHaveBeenCalled();
    expect(writeFile).toHaveBeenCalled();
  });

  it('sends event once when warnings change', async () => {
    jest.resetModules();

    const fs = await import('fs');
    const writeFile = fs.promises.writeFile as unknown as jest.Mock;

    const {WarningsCronService} = await import('../../src/services/WarningsCronService');

    const service = new WarningsCronService();
    (service as any).logger = {info: jest.fn(), warn: jest.fn(), error: jest.fn()};
    (service as any).weatherApplication = {getWarnings: jest.fn()};
    const execute = jest.fn().mockResolvedValue({});
    (service as any).httpClient = {execute};

    const warnings = buildWarningsResponse();

    await (service as any).processWarnings(warnings, false);
    await (service as any).processWarnings(warnings, false);

    expect(execute).toHaveBeenCalledTimes(1);
    expect(writeFile).toHaveBeenCalledTimes(1);
  });

  it('skips sending when credentials are missing', async () => {
    jest.resetModules();

    process.env.USER = '';
    process.env.PASSWORD = '';

    const {WarningsCronService} = await import('../../src/services/WarningsCronService');

    const service = new WarningsCronService();
    (service as any).logger = {info: jest.fn(), warn: jest.fn(), error: jest.fn()};
    (service as any).weatherApplication = {getWarnings: jest.fn()};
    const execute = jest.fn();
    (service as any).httpClient = {execute};

    await (service as any).processWarnings(buildWarningsResponse(), false);

    expect(execute).not.toHaveBeenCalled();
  });

  it('avoids sending when signature is unchanged', async () => {
    jest.resetModules();

    const fs = await import('fs');
    const writeFile = fs.promises.writeFile as unknown as jest.Mock;

    const {WarningsCronService} = await import('../../src/services/WarningsCronService');

    const service = new WarningsCronService();
    (service as any).logger = {info: jest.fn(), warn: jest.fn(), error: jest.fn()};
    (service as any).weatherApplication = {getWarnings: jest.fn()};
    const execute = jest.fn().mockResolvedValue({});
    (service as any).httpClient = {execute};

    const warnings = buildWarningsResponse();

    await (service as any).processWarnings(warnings, false);
    writeFile.mockClear();
    execute.mockClear();

    await (service as any).processWarnings(warnings, false);

    expect(execute).not.toHaveBeenCalled();
    expect(writeFile).not.toHaveBeenCalled();
  });

  it('does not throw when event gateway request fails', async () => {
    jest.resetModules();

    const fs = await import('fs');
    const writeFile = fs.promises.writeFile as unknown as jest.Mock;

    const {WarningsCronService} = await import('../../src/services/WarningsCronService');

    const service = new WarningsCronService();
    (service as any).logger = {info: jest.fn(), warn: jest.fn(), error: jest.fn()};
    (service as any).weatherApplication = {getWarnings: jest.fn()};
    const execute = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));
    (service as any).httpClient = {execute};

    await expect((service as any).processWarnings(buildWarningsResponse(), false)).resolves.toBeUndefined();
    expect(writeFile).not.toHaveBeenCalled();
  });

  it('loads last signature from storage when requested', async () => {
    jest.resetModules();

    const fs = await import('fs');
    const readFile = fs.promises.readFile as unknown as jest.Mock;

    const {WarningsCronService} = await import('../../src/services/WarningsCronService');

    const service = new WarningsCronService();
    (service as any).logger = {info: jest.fn(), warn: jest.fn(), error: jest.fn()};
    (service as any).weatherApplication = {getWarnings: jest.fn()};
    const execute = jest.fn();
    (service as any).httpClient = {execute};

    const warnings = buildWarningsResponse();
    const signature = (service as any).buildWarningsSignature(warnings);
    readFile.mockResolvedValue(JSON.stringify({signature}));

    await (service as any).processWarnings(warnings, true);

    expect(readFile).toHaveBeenCalled();
    expect(execute).not.toHaveBeenCalled();
  });
});
