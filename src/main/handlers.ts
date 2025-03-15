import { readFileSync, writeFileSync } from 'fs';
import { STINT_DATA_PATH, TIRE_DATA_PATH, TRACK_DATA_PATH } from './dataPaths';
import { Stint, Stints, Tire, Tires, Track } from '../shared/model';

const readTrackDataFromFile = () => {
  const data = JSON.parse(readFileSync(TRACK_DATA_PATH, 'utf-8'));
  return data;
};

const readTireDataFromFile = () => {
  const data = JSON.parse(readFileSync(TIRE_DATA_PATH, 'utf-8')) as Tires;
  return data.tires;
};

const tracks: { [trackId: string]: Track } = readTrackDataFromFile();

const getTrack = (trackId: string): Track | undefined => {
  return tracks[trackId];
};

const getTracks = (): Track[] => {
  return Object.values(tracks);
};

const tires = readTireDataFromFile();

const getTire = (_, tireId: string): Tire | undefined => {
  return tires.find((tire) => tire.tireId === tireId);
};

const enrichStintsWithTrackData = (stints: Stint[]): Stint[] => {
  return stints.map((stint) => {
    const track = getTrack(stint.trackId);
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
  console.log('stint data', data);
  return enrichStintsWithTrackData(data.stints);
};

export const handlers = [getTires, saveTireData, getStintData, getTire, getTracks];
