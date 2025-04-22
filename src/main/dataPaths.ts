import { app } from 'electron';

const basePath = app.getPath('userData') + '/';
const tireDataFileName = 'tire-data.json';
const stintDataFileName = 'stint-data.json';

export const TIRE_DATA_PATH = basePath + tireDataFileName;
export const STINT_DATA_PATH = basePath + stintDataFileName;
