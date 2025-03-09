import { readFileSync, writeFileSync } from 'fs';
import { TIRE_DATA_PATH, TRACK_DATA_PATH } from './dataPaths';
import { Tire, Tires, Track } from '../shared/model';

const readTrackDataFromFile = () => {
  const data = JSON.parse(readFileSync(TRACK_DATA_PATH, 'utf-8'));
  console.log('track data', data);
  return data;
};

const tracks: { [trackId: string]: Track } = readTrackDataFromFile();

const getTrack = (trackId: string): Track | undefined => {
  return tracks[trackId];
};

const enrichTiresWithTrackData = (tires: Tire[]): Tire[] => {
  return tires.map(({ stints, ...tire }) => ({
    ...tire,
    stints: stints.map((stint) => {
      const track = getTrack(stint.trackId);
      if (!track) return stint;
      return {
        ...stint,
        date: new Date(stint.date),
        trackName: track.name,
        distance: stint.laps * track.length
      };
    })
  }));
};

const getTireData = () => {
  const data = JSON.parse(readFileSync(TIRE_DATA_PATH, 'utf-8')) as Tires;
  console.log('tire data', data);
  return enrichTiresWithTrackData(data.tires);
};

const saveTireData = (_, data: any) => {
  writeFileSync(TIRE_DATA_PATH, data);
};

export const handlers = [getTireData, saveTireData, getTrack];
