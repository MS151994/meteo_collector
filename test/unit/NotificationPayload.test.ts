/// <reference types="jest" />

import {NotificationPayload} from '../../src/payloads/NotificationPayload';
import {SeverityType} from '../../src/infrastructure/enum/SeverityType';
import {PriorityType} from '../../src/infrastructure/enum/PriorityType';

describe('NotificationPayload.toForm', () => {
  it('omits unset optional fields', () => {
    const form = new NotificationPayload({
      type: 'weather',
      title: 'T',
      message: 'M',
      severity: SeverityType.WARNING,
    }).toForm();

    expect(form).toEqual({type: 'weather', title: 'T', message: 'M', severity: 'warning'});
    expect('priority' in form).toBe(false);
    expect('createdAt' in form).toBe(false);
  });

  it('serializes enums and ISO-formats dates', () => {
    const createdAt = new Date('2024-01-02T03:04:05.000Z');
    const form = new NotificationPayload({
      type: 'weather',
      title: 'T',
      message: 'M',
      severity: SeverityType.WARNING,
      priority: PriorityType.HIGH,
      createdAt,
    }).toForm();

    expect(form.priority).toBe('3');
    expect(form.createdAt).toBe('2024-01-02T03:04:05.000Z');
  });
});
