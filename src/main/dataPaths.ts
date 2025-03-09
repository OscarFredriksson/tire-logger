import { app } from 'electron';

const basePath = app.getPath('userData') + '/';
const tireDataFileName = 'tire-data.json';
const trackDataFileName = 'track-data.json';
const stintDataFileName = 'stint-data.json';

export const TIRE_DATA_PATH = basePath + tireDataFileName;
export const TRACK_DATA_PATH = basePath + trackDataFileName;
export const STINT_DATA_PATH = basePath + stintDataFileName;
