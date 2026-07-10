/// <reference types="jest" />

import 'reflect-metadata';

jest.mock('got', () => ({__esModule: true, default: jest.fn()}));

import {NotificationPayload} from '../../src/payloads/NotificationPayload';
import {SeverityType} from '../../src/infrastructure/enum/SeverityType';

const buildPayload = (): NotificationPayload =>
  new NotificationPayload({
    type: 'weather',
    title: 'Pogoda: Burza 70%',
    message: 'Burza z gradem',
    severity: SeverityType.WARNING,
  });

const buildService = async (execute: jest.Mock) => {
  const {NotificationEventService} = await import('../../src/services/NotificationEventService');
  const service = new NotificationEventService();
  (service as any).logger = {info: jest.fn(), warning: jest.fn(), error: jest.fn()};
  (service as any).httpClient = {execute};
  return service;
};

describe('NotificationEventService', () => {
  beforeEach(() => {
    process.env.USER = 'user';
    process.env.PASSWORD = 'pass';
  });

  it('skips and returns false when credentials are missing', async () => {
    jest.resetModules();
    process.env.USER = '';
    process.env.PASSWORD = '';

    const execute = jest.fn();
    const service = await buildService(execute);

    const sent = await service.notify(buildPayload());

    expect(sent).toBe(false);
    expect(execute).not.toHaveBeenCalled();
  });

  it('sends the payload and returns true', async () => {
    jest.resetModules();
    const execute = jest.fn().mockResolvedValue({});
    const service = await buildService(execute);

    const sent = await service.notify(buildPayload());

    expect(sent).toBe(true);
    expect(execute).toHaveBeenCalledTimes(1);

    const form = execute.mock.calls[0][0].getQuery().form;
    expect(form.type).toBe('weather');
    expect(form.severity).toBe('warning');
    expect(form.title).toBe('Pogoda: Burza 70%');
  });
});
