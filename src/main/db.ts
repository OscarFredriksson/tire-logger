import Database, { Statement } from 'better-sqlite3';
import { Stint, Tire, Track } from '../shared/model';

const db = new Database('resources/tire-logger.db', {});
db.pragma('journal_mode = WAL');

db.prepare(
  "CREATE TABLE IF NOT EXISTS tracks('trackId' varchar PRIMARY KEY, 'name' varchar, 'length' int);"
).run();

db.prepare(
  'CREATE TABLE IF NOT EXISTS stints(' +
    "'stintId' varchar PRIMARY KEY, " +
    "'trackId' varchar, " +
    "'carId' varchar, " +
    "'date' varchar, " +
    "'laps' int, " +
    "'leftFront' varchar, " +
    "'rightFront' varchar, " +
    "'leftRear' varchar, " +
    "'rightRear' varchar, " +
    "'note' varchar" +
    ');'
).run();

db.prepare(
  'CREATE TABLE IF NOT EXISTS tires(' +
    "'tireId' varchar PRIMARY KEY, " +
    "'name' varchar, " +
    "'allowedLf' int, " +
    "'allowedRf' int, " +
    "'allowedLr' int, " +
    "'allowedRr' int" +
    ');'
).run();

export const queryTracks: Statement<[], Track> = db.prepare('SELECT * FROM tracks');

export const updateTrack: Statement = db.prepare(
  'UPDATE tracks SET name = ?, length = ? WHERE trackId = ?;'
);

export const insertTrack: Statement = db.prepare(
  'INSERT INTO tracks (trackId, name, length) VALUES (?, ?, ?);'
);

export const deleteTrackId: Statement = db.prepare('DELETE FROM tracks WHERE trackId = ?;');

export const updateStint: Statement = db.prepare(
  'UPDATE stints SET trackId = ?, date = ?, laps = ?, leftFront = ?, rightFront = ?, leftRear = ?, rightRear = ?, note = ? WHERE stintId = ?;'
);

export const insertStint: Statement = db.prepare(
  'INSERT INTO stints (stintId, trackId, carId, date, laps, leftFront, rightFront, leftRear, rightRear, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);'
);

export const queryStints: Statement<[], Stint> = db.prepare('SELECT * FROM stints');

export const queryTires: Statement<[], Tire> = db.prepare('SELECT * FROM tires');

export const updateTire: Statement = db.prepare(
  'UPDATE tires SET name = ?, allowedLf = ?, allowedRf = ?, allowedLr = ?, allowedRr = ? WHERE tireId = ?;'
);

export const insertTire: Statement = db.prepare(
  'INSERT INTO tires (tireId, name, allowedLf, allowedRf, allowedLr, allowedRr) VALUES (?, ?, ?, ?, ?, ?);'
);
