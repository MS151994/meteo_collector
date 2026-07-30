/// <reference types="jest" />

import 'reflect-metadata';

jest.mock('node-cron', () => ({
  schedule: jest.fn(),
}));

const buildWorker = async () => {
  const {WarningsCronWorker} = await import('../../src/worker/WarningsCronWorker');
  const worker = new WarningsCronWorker();
  const pipeline = {run: jest.fn().mockResolvedValue(undefined)};
  (worker as any).logger = {info: jest.fn(), warning: jest.fn(), error: jest.fn()};
  (worker as any).haMqttService = {start: jest.fn().mockResolvedValue(undefined)};
  (worker as any).pipeline = pipeline;
  return {worker, pipeline};
};

describe('WarningsCronWorker', () => {
  beforeEach(() => {
    process.env.WARNINGS_CRON_SCHEDULE = '*/5 * * * *';
  });

  it('schedules the pipeline on the env cron and kicks an initial run', async () => {
    jest.resetModules();
    const cron = await import('node-cron');
    const schedule = cron.schedule as unknown as jest.Mock;

    const {worker, pipeline} = await buildWorker();
    worker.start();

    expect(schedule).toHaveBeenCalledWith('*/5 * * * *', expect.any(Function), {timezone: 'Europe/Warsaw'});
    // initial run kicked immediately
    expect(pipeline.run).toHaveBeenCalledTimes(1);

    // the scheduled callback delegates to the pipeline
    const scheduledCallback = schedule.mock.calls[0][1];
    scheduledCallback();
    expect(pipeline.run).toHaveBeenCalledTimes(2);
  });
});
