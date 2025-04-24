import { readFileSync } from 'fs';
import { STINT_DATA_PATH } from './dataPaths';
import { PartialValue, Stint, Stints, Tire, Track } from '../shared/model';
import { randomUUID } from 'crypto';
import {
  deleteTrackId,
  insertStint,
  insertTire,
  insertTrack,
  queryTires,
  queryTracks,
  updateStint,
  updateTire,
  updateTrack
} from './db';

const getTracks = (): Track[] => {
  return queryTracks.all();
};

const putTrack = (_, track: PartialValue<Track, 'trackId'>) => {
  console.log('putTrack', track);

  if (track.trackId) {
    console.log('Updating track', track.trackId);
    updateTrack.run(track.name, track.length, track.trackId);
  } else {
    console.log('Inserting track', track.name);
    insertTrack.run(randomUUID(), track.name, track.length);
  }
};

const deleteTrack = (_, trackId: string) => {
  console.log('Deleting track', trackId);
  deleteTrackId.run(trackId);
};

const putStint = (_, stint: PartialValue<Stint, 'stintId'>) => {
  console.log('putStint', stint);

  if (stint.stintId) {
    console.log('Updating stint', stint.stintId);
    updateStint.run(
      stint.trackId,
      stint.carId || '1',
      stint.date.toISOString(),
      stint.laps,
      stint.leftFront,
      stint.rightFront,
      stint.leftRear,
      stint.rightRear,
      stint.note
    );
  } else {
    console.log('Inserting stint', stint.trackId);
    insertStint.run(
      randomUUID(),
      stint.trackId,
      stint.carId || '1',
      stint.date.toISOString(),
      stint.laps,
      stint.leftFront,
      stint.rightFront,
      stint.leftRear,
      stint.rightRear,
      stint.note
    );
  }
};

const enrichStintsWithTrackData = (stints: Stint[]): Stint[] => {
  return stints.map((stint) => {
    const track = getTracks().find(({ trackId }) => trackId === stint.trackId);
    if (!track) return stint;
    return {
      ...stint,
      date: new Date(stint.date),
      trackName: track.name,
      distance: stint.laps * track.length
    };
  });
};

// const enrichTiresWithTrackData = (tires: Tire[]): Tire[] => {
//   return tires.map(({ stints, ...tire }) => ({
//     ...tire,
//     stints: enrichStintsWithTrackData(stints)
//   }));
// };

const getTires = () => {
  return queryTires.all();
};

const putTire = (_, tire: PartialValue<Tire, 'tireId'>) => {
  console.log('putTire', tire);

  if (tire.tireId) {
    console.log('Updating tire', tire.tireId);
    updateTire.run(
      tire.name,
      tire.allowedLf,
      tire.allowedRf,
      tire.allowedLr,
      tire.allowedRr,
      tire.tireId
    );
  } else {
    console.log('Inserting tire', tire.name);
    insertTire.run(
      randomUUID(),
      tire.name,
      tire.allowedLf ? 1 : 0, // TODO: generalize this convertion
      tire.allowedRf ? 1 : 0,
      tire.allowedLr ? 1 : 0,
      tire.allowedRr ? 1 : 0
    );
  }
};

const getStintData = () => {
  const data = JSON.parse(readFileSync(STINT_DATA_PATH, 'utf-8')) as Stints;
  return enrichStintsWithTrackData(data.stints);
};

export const handlers = [
  getTires,
  putTire,
  getStintData,
  putStint,
  getTracks,
  putTrack,
  deleteTrack
];
