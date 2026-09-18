import { describe, expect, it } from '@jest/globals';
import { schemaResolver } from '@mantine/form';
import { carSchema } from '@shared/schema/carSchema';
import { trackSchema } from '@shared/schema/trackSchema';
import { tireSchema } from '@shared/schema/tireSchema';
import { stintSchema } from '@shared/schema/stintSchema';

describe('Mantine form validation with Zod 4', () => {
  const validateCar = schemaResolver(carSchema, { sync: true });
  const validateTrack = schemaResolver(trackSchema, { sync: true });
  const validateTire = schemaResolver(tireSchema, { sync: true });
  const validateStint = schemaResolver(stintSchema, { sync: true });
  const stint = {
    carId: 'car',
    trackId: 'track',
    date: new Date(2026, 8, 18, 14, 30),
    laps: 1,
    leftFront: 'lf',
    rightFront: 'rf',
    leftRear: 'lr',
    rightRear: 'rr'
  };

  it('validates car and track fields synchronously', () => {
    expect(validateCar({ name: 'Car' })).toEqual({});
    expect(validateCar({ name: '' })).toEqual({ name: 'Name is required' });
    expect(validateTrack({ name: 'Track', length: 1000 })).toEqual({});
    expect(validateTrack({ name: 'Track', length: 0 })).toEqual({
      length: 'Length must be a positive number'
    });
  });

  it('keeps tire-position refinement errors on the checkbox group', () => {
    expect(validateTire({ name: 'Tire', allowedLf: true })).toEqual({});
    expect(validateTire({ name: 'Tire' })).toEqual({
      allowedLf: 'At least one tire position must be selected'
    });
  });

  it.each([undefined, '', 'Existing notes'])('accepts optional stint notes: %s', (note) => {
    expect(validateStint({ ...stint, note })).toEqual({});
  });

  it('accepts edited Date values and rejects cleared or unconverted dates', () => {
    expect(validateStint({ ...stint, date: new Date(2026, 8, 19, 16, 45) })).toEqual({});
    for (const date of [undefined, null, '2026-09-19 16:45:00', new Date('invalid')]) {
      expect(validateStint({ ...stint, date })).toEqual({ date: 'Date is required' });
    }
  });
});
