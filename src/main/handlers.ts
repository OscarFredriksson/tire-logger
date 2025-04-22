import { readFileSync, writeFileSync } from 'fs';
import { STINT_DATA_PATH, TIRE_DATA_PATH } from './dataPaths';
import { PartialValue, Stint, Stints, Tire, Tires, Track } from '../shared/model';
import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';

const db = new Database('resources/tire-logger.db', {});
db.pragma('journal_mode = WAL');

db.prepare(
  "CREATE TABLE IF NOT EXISTS tracks('trackId' varchar PRIMARY KEY, 'name' varchar, 'length' int);"
).run();

const insertTrack = db.prepare(
  'INSERT OR IGNORE INTO tracks (trackId, name, length) VALUES (?, ?, ?);'
);

insertTrack.run('1', 'Mantorp Park', 3106);
insertTrack.run('2', 'Gelleråsen', 2350);

const queryTracks = db.prepare<[], Track>('SELECT * FROM tracks');

const readTireDataFromFile = () => {
  const data = JSON.parse(readFileSync(TIRE_DATA_PATH, 'utf-8')) as Tires;
  return data.tires;
};

const getTracks = (): Track[] => {
  return queryTracks.all();
};

const putTrack = (_, track: PartialValue<Track, 'trackId'>) => {
  console.log('putTrack', track);

  if (track.trackId) {
    console.log('Updating track', track.trackId);
    db.prepare('UPDATE tracks SET name = ?, length = ? WHERE trackId = ?;').run(
      track.name,
      track.length,
      track.trackId
    );
  } else {
    console.log('Inserting track', track.name);
    db.prepare('INSERT INTO tracks (trackId, name, length) VALUES (?, ?, ?);').run(
      randomUUID(),
      track.name,
      track.length
    );
  }
};

const tires = readTireDataFromFile();

const getTire = (_, tireId: string): Tire | undefined => {
  return tires.find((tire) => tire.tireId === tireId);
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

const enrichTiresWithTrackData = (tires: Tire[]): Tire[] => {
  return tires.map(({ stints, ...tire }) => ({
    ...tire,
    stints: enrichStintsWithTrackData(stints)
  }));
};

const getTires = async () => {
  return enrichTiresWithTrackData(tires);
};

const saveTireData = (_, data: any) => {
  writeFileSync(TIRE_DATA_PATH, data);
};

const getStintData = () => {
  const data = JSON.parse(readFileSync(STINT_DATA_PATH, 'utf-8')) as Stints;
  return enrichStintsWithTrackData(data.stints);
};

export const handlers = [getTires, saveTireData, getStintData, getTire, getTracks, putTrack];
