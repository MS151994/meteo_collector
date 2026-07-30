/// <reference types="jest" />

import 'reflect-metadata';

import {IMGWWarningModel} from '../../src/models/WarningModel';
import {WarningPayload} from '../../src/payloads/WarningPayload';
import {WarningNotificationFactory} from '../../src/services/WarningNotificationFactory';
import {TimeHelper} from '../../src/helper/TimeHelper';
import {SeverityType} from '../../src/infrastructure/enum/SeverityType';
import {PriorityType} from '../../src/infrastructure/enum/PriorityType';
import {LabelType} from '../../src/infrastructure/enum/LabelType';

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

describe('WarningNotificationFactory', () => {
  const factory = new WarningNotificationFactory();
  (factory as any).timeHelper = new TimeHelper();

  it('maps core fields from a single warning', () => {
    const payload = factory.fromWarning(buildWarning());

    expect(payload.type).toBe('weather');
    expect(payload.label).toBe(LabelType.NOTIFICATION);
    expect(payload.title).toBe('Pogoda: Burza 70%');
    expect(payload.message).toContain('Burza z gradem');
    expect(payload.message).toContain('Uwaga');
  });

  it('always sets severity to WARNING', () => {
    expect(factory.fromWarning(buildWarning({stopien: 1})).severity).toBe(SeverityType.WARNING);
    expect(factory.fromWarning(buildWarning({stopien: 3})).severity).toBe(SeverityType.WARNING);
  });

  it('maps level to priority', () => {
    expect(factory.fromWarning(buildWarning({stopien: 1})).priority).toBe(PriorityType.LOW);
    expect(factory.fromWarning(buildWarning({stopien: 2})).priority).toBe(PriorityType.MEDIUM);
    expect(factory.fromWarning(buildWarning({stopien: 3})).priority).toBe(PriorityType.HIGH);
  });
});
