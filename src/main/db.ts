import Database, { Statement } from 'better-sqlite3';
import { Car, Stint, Track } from '../shared/model';
import { app } from 'electron';
import path from 'path';
// import { randomUUID } from 'crypto';

// TODO: Add createdAt and updatedAt columns to all tables

const dbPath =
  process.env.NODE_ENV_ELECTRON_VITE === 'development'
    ? './tire-logger.db'
    : path.join(app.getPath('userData'), 'tire-logger.db');

const db = new Database(dbPath, {});
db.pragma('journal_mode = WAL');

db.prepare("CREATE TABLE IF NOT EXISTS cars('carId' varchar PRIMARY KEY, 'name' varchar);").run();

db.prepare(
  "CREATE TABLE IF NOT EXISTS tracks('trackId' varchar PRIMARY KEY, 'name' varchar, 'length' int);"
).run();

db.prepare(
  'CREATE TABLE IF NOT EXISTS tires(' +
    "'tireId' varchar PRIMARY KEY, " +
    "'name' varchar, " +
    "'carId' varchar NOT NULL, " +
    "'allowedLf' int, " +
    "'allowedRf' int, " +
    "'allowedLr' int, " +
    "'allowedRr' int, " +
    'FOREIGN KEY(carId) REFERENCES cars(carId) ON DELETE CASCADE);'
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
    "'FOREIGN KEY(trackId)' REFERENCES tracks(trackId), " +
    "'FOREIGN KEY(carId)' REFERENCES cars(carId), " +
    "'FOREIGN KEY(leftFront)' REFERENCES tires(tireId), " +
    "'FOREIGN KEY(rightFront)' REFERENCES tires(tireId), " +
    "'FOREIGN KEY(leftRear)' REFERENCES tires(tireId), " +
    "'FOREIGN KEY(rightRear)' REFERENCES tires(tireId), " +
    "'note' varchar" +
    ');'
).run();

export const queryCars: Statement<[], Car> = db.prepare('SELECT * FROM cars');

export const insertCar: Statement = db.prepare('INSERT INTO cars (carId, name) VALUES (?, ?);');

export const updateCar: Statement = db.prepare('UPDATE cars SET name = ? WHERE carId = ?;');

export const deleteCarId: Statement = db.prepare('DELETE FROM cars WHERE carId = ?;');

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

export const queryStints: Statement<[], Stint> = db.prepare(
  'SELECT * FROM stints ORDER BY date DESC'
);

export const queryTires: Statement = db.prepare('SELECT * FROM tires');

export const updateTire: Statement = db.prepare(
  'UPDATE tires SET name = ?, allowedLf = ?, allowedRf = ?, allowedLr = ?, allowedRr = ? WHERE tireId = ?;'
);

export const insertTire: Statement = db.prepare(
  'INSERT INTO tires (tireId, name, carId, allowedLf, allowedRf, allowedLr, allowedRr) VALUES (?, ?, ?, ?, ?, ?, ?);'
);
