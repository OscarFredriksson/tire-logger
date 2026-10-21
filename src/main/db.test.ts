import { describe, expect, it, jest } from '@jest/globals';
import {
  archiveTireWithStints,
  importData,
  importDataWithOptions,
  insertCar,
  insertStint,
  insertTire,
  insertTrack,
  queryCars,
  queryStints,
  queryTires
} from './db';
import { importSchema } from '../shared/schema/importSchema';

jest.mock('electron', () => ({ app: { getPath: () => '.' } }));
jest.mock('better-sqlite3', () => {
  const Database = jest.requireActual<typeof import('better-sqlite3')>('better-sqlite3');
  return function InMemoryDatabase() {
    return new Database(':memory:');
  };
});

describe('Tire archiving', () => {
  it.each(['leftFront', 'rightFront', 'leftRear', 'rightRear'])(
    'archives related stints at %s without changing unrelated records',
    (position) => {
      const carId = `car-${position}`;
      const tireId = `tire-${position}`;
      const otherTireId = `other-${position}`;
      const trackId = `track-${position}`;
      insertCar.run(carId, 'Car');
      insertTrack.run(trackId, 'Track', 1000);
      insertTire.run(tireId, 'Tire', carId, 1, 1, 1, 1);
      insertTire.run(otherTireId, 'Other tire', carId, 1, 1, 1, 1);

      for (const related of [true, false]) {
        const tires = ['leftFront', 'rightFront', 'leftRear', 'rightRear'].map((slot) =>
          related && slot === position ? tireId : otherTireId
        );
        insertStint.run(
          `${carId}-${related}`,
          trackId,
          carId,
          '2026-09-27T12:00:00.000Z',
          10,
          ...tires,
          ''
        );
      }

      archiveTireWithStints(tireId);

      expect(queryTires.all(carId, 1).map((tire) => tire.tireId)).toEqual([tireId]);
      expect(queryTires.all(carId, 0).map((tire) => tire.tireId)).toEqual([otherTireId]);
      expect(queryStints.all(carId, 1).map((stint) => stint.stintId)).toEqual([`${carId}-true`]);
      expect(queryStints.all(carId, 0).map((stint) => stint.stintId)).toEqual([`${carId}-false`]);
    }
  );
});

describe('Imported archive flags', () => {
  it.each(['replace', 'ignore', 'fail', 'merge'] as const)(
    'normalizes mixed legacy and archived rows with %s',
    (conflictResolution) => {
      const activeId = `mixed-active-${conflictResolution}`;
      const archivedId = `mixed-archived-${conflictResolution}`;
      importDataWithOptions(
        {
          cars: [
            { carId: archivedId, name: 'Archived car', archived: true },
            { carId: activeId, name: 'Legacy car' }
          ]
        },
        { conflictResolution }
      );
      expect(queryCars.all(0).some((car) => car.carId === activeId)).toBe(true);
      expect(queryCars.all(1).some((car) => car.carId === archivedId)).toBe(true);
    }
  );

  it('validates and normalizes the legacy import entry point', () => {
    importData({ cars: [{ carId: 'legacy-entry', name: 'Archived car', archived: true }] });
    expect(queryCars.all(1).some((car) => car.carId === 'legacy-entry')).toBe(true);
    expect(() =>
      importData({ cars: [{ carId: 'legacy-entry', name: 'Invalid', archived: 2 }] })
    ).toThrow();
    expect(queryCars.all(1).find((car) => car.carId === 'legacy-entry')?.name).toBe('Archived car');
  });

  it.each([true, false, 0, 1])('normalizes archive flag %s for inserts and updates', (archived) => {
    const carId = `import-${typeof archived}-${archived}`;
    const payload = {
      data: { cars: [{ carId, name: 'Imported car', archived }], tracks: [], tires: [], stints: [] }
    };
    const flag = archived ? 1 : 0;
    expect(importSchema.parse(payload).data.cars[0].archived).toBe(flag);
    importDataWithOptions(payload, { conflictResolution: 'merge' });
    expect(queryCars.all(flag).find((car) => car.carId === carId)).toHaveProperty('archived', flag);

    payload.data.cars[0].archived = !archived;
    importDataWithOptions(payload, { conflictResolution: 'merge' });
    expect(queryCars.all(1 - flag).find((car) => car.carId === carId)).toHaveProperty(
      'archived',
      1 - flag
    );
  });

  it.each(['false', 'true', 2, -1, null])(
    'rejects invalid archive flag %s and rolls back the import',
    (archived) => {
      const carId = `invalid-import-${archived}`;
      const payload = {
        data: {
          cars: [{ carId, name: 'Should be rolled back' }],
          tracks: [{ trackId: carId, name: 'Invalid track', length: 1000, archived }],
          tires: [],
          stints: []
        }
      };
      expect(importSchema.safeParse(payload).success).toBe(false);
      expect(() => importDataWithOptions(payload, { conflictResolution: 'merge' })).toThrow();
      expect(queryCars.all(0).some((car) => car.carId === carId)).toBe(false);
    }
  );

  it('preserves legacy flags and handles mixed rows without dropping archive state', () => {
    importDataWithOptions(
      {
        cars: [
          { carId: 'legacy-import', name: 'Legacy car' },
          { carId: 'archived-import', name: 'Archived car', archived: true }
        ]
      },
      { conflictResolution: 'merge' }
    );
    expect(queryCars.all(0).some((car) => car.carId === 'legacy-import')).toBe(true);
    expect(queryCars.all(1).some((car) => car.carId === 'archived-import')).toBe(true);
    importDataWithOptions(
      { cars: [{ carId: 'archived-import', name: 'Updated legacy car' }] },
      { conflictResolution: 'merge' }
    );
    expect(queryCars.all(1).find((car) => car.carId === 'archived-import')?.name).toBe(
      'Updated legacy car'
    );
  });
});
