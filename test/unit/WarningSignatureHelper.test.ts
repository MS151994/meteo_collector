/// <reference types="jest" />

import 'reflect-metadata';

import {IMGWWarningModel} from '../../src/models/WarningModel';
import {WarningPayload} from '../../src/payloads/WarningPayload';
import {WarningSignatureHelper} from '../../src/helper/WarningSignatureHelper';

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

describe('WarningSignatureHelper', () => {
  const helper = new WarningSignatureHelper();

  it('forHistory ignores comment and dates', () => {
    const a = helper.forHistory(buildWarning({komentarz: 'x', obowiazuje_do: '2024-01-01T01:00:00Z'}));
    const b = helper.forHistory(buildWarning({komentarz: 'y', obowiazuje_do: '2024-01-01T09:00:00Z'}));
    expect(a).toBe(b);
  });

  it('forHistory changes when content/level/probability change', () => {
    const base = helper.forHistory(buildWarning());
    expect(helper.forHistory(buildWarning({tresc: 'Silny wiatr'}))).not.toBe(base);
    expect(helper.forHistory(buildWarning({stopien: 3}))).not.toBe(base);
    expect(helper.forHistory(buildWarning({prawdopodobienstwo: 90}))).not.toBe(base);
  });

  it('forNotification reacts to comment changes (unlike forHistory)', () => {
    const a = buildWarning({komentarz: 'stary'});
    const b = buildWarning({komentarz: 'nowy komentarz'});
    expect(helper.forHistory(a)).toBe(helper.forHistory(b));
    expect(helper.forNotification(a)).not.toBe(helper.forNotification(b));
  });
});
