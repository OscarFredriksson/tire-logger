import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { handlers } from './handlers';
import { updateCar, updateStint, updateTrack } from './db';

jest.mock('electron', () => ({}));
jest.mock('./db', () => ({
  updateCar: { run: jest.fn() },
  updateTrack: { run: jest.fn() },
  updateStint: { run: jest.fn() }
}));

function invokeHandler(name: string, payload: object): void {
  const handler = handlers.find((candidate) => candidate.name === name);
  if (!handler) throw new Error(`Handler ${name} not found`);
  Reflect.apply(handler, undefined, [undefined, payload]);
}

describe('Archive-aware update handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([false, true, undefined])('binds car archive state %s before its ID', (archived) => {
    invokeHandler('putCar', { carId: 'car', name: 'Car', archived });
    expect(updateCar.run).toHaveBeenCalledWith('Car', archived ? 1 : 0, 'car');
  });

  it.each([false, true, undefined])('binds track archive state %s before its ID', (archived) => {
    invokeHandler('putTrack', { trackId: 'track', name: 'Track', length: 1000, archived });
    expect(updateTrack.run).toHaveBeenCalledWith('Track', 1000, archived ? 1 : 0, 'track');
  });

  it.each([false, true, undefined])('binds stint archive state %s before its ID', (archived) => {
    const date = new Date('2026-09-27T12:00:00.000Z');
    invokeHandler('putStint', {
      stintId: 'stint',
      carId: 'car',
      trackId: 'track',
      date,
      laps: 1,
      leftFront: 'lf',
      rightFront: 'rf',
      leftRear: 'lr',
      rightRear: 'rr',
      note: '',
      archived
    });
    expect(updateStint.run).toHaveBeenCalledWith(
      'track',
      date.toISOString(),
      1,
      'lf',
      'rf',
      'lr',
      'rr',
      '',
      archived ? 1 : 0,
      'stint'
    );
  });
});
