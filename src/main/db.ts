import Database, { Statement } from 'better-sqlite3';
import type { Database as BetterSqlite3Database } from 'better-sqlite3';
import { Car, Stint, Tire, Track } from '../shared/model';
import { app } from 'electron';
import path from 'path';

// TODO: Add createdAt and updatedAt columns to all tables

const dbPath =
  process.env.NODE_ENV_ELECTRON_VITE === 'development'
    ? './tire-logger.db'
    : path.join(app.getPath('userData'), 'tire-logger.db');

const db = new Database(dbPath, {});
// Will only add the archived flag to existing records
migrateAddArchivedFlag(db);

db.pragma('journal_mode = WAL');

db.prepare(
  "CREATE TABLE IF NOT EXISTS cars('carId' varchar PRIMARY KEY, 'name' varchar, 'archived' INTEGER DEFAULT 0);"
).run();

db.prepare(
  "CREATE TABLE IF NOT EXISTS tracks('trackId' varchar PRIMARY KEY, 'name' varchar, 'length' int, 'archived' INTEGER DEFAULT 0);"
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
    "'archived' INTEGER DEFAULT 0, " +
    'FOREIGN KEY(carId) REFERENCES cars(carId) ON DELETE CASCADE);'
).run();

db.prepare(
  'CREATE TABLE IF NOT EXISTS stints(' +
    "'stintId' varchar PRIMARY KEY, " +
    "'trackId' varchar NOT NULL, " +
    "'carId' varchar NOT NULL, " +
    "'date' varchar, " +
    "'laps' int, " +
    "'leftFront' varchar NOT NULL, " +
    "'rightFront' varchar NOT NULL, " +
    "'leftRear' varchar NOT NULL, " +
    "'rightRear' varchar NOT NULL, " +
    "'note' varchar, " +
    "'archived' INTEGER DEFAULT 0, " +
    'FOREIGN KEY(trackId) REFERENCES tracks(trackId) ON DELETE CASCADE, ' +
    'FOREIGN KEY(carId) REFERENCES cars(carId) ON DELETE CASCADE, ' +
    'FOREIGN KEY(leftFront) REFERENCES tires(tireId) ON DELETE CASCADE, ' +
    'FOREIGN KEY(rightFront) REFERENCES tires(tireId) ON DELETE CASCADE, ' +
    'FOREIGN KEY(leftRear) REFERENCES tires(tireId) ON DELETE CASCADE, ' +
    'FOREIGN KEY(rightRear) REFERENCES tires(tireId) ON DELETE CASCADE);'
).run();

// Queries: Only fetch non-archived records
export const queryCars: Statement<[number], Car> = db.prepare(
  'SELECT * FROM cars WHERE archived = ?'
);
export const queryTracks: Statement<[number], Track> = db.prepare(
  'SELECT * FROM tracks WHERE archived = ?'
);
export const queryStints: Statement<[string, number], Stint> = db.prepare(
  'SELECT * FROM stints WHERE carId IS ? AND archived = ? ORDER BY date DESC;'
);
export const queryTires: Statement<[string, number], Tire> = db.prepare(
  'SELECT * FROM tires WHERE carId IS ? AND archived = ?;'
);

// Inserts: Set archived to 0 by default
export const insertCar: Statement = db.prepare(
  'INSERT INTO cars (carId, name, archived) VALUES (?, ?, 0);'
);
export const insertTrack: Statement = db.prepare(
  'INSERT INTO tracks (trackId, name, length, archived) VALUES (?, ?, ?, 0);'
);
export const insertTire: Statement = db.prepare(
  'INSERT INTO tires (tireId, name, carId, allowedLf, allowedRf, allowedLr, allowedRr, archived) VALUES (?, ?, ?, ?, ?, ?, ?, 0);'
);
export const insertStint: Statement = db.prepare(
  'INSERT INTO stints (stintId, trackId, carId, date, laps, leftFront, rightFront, leftRear, rightRear, note, archived) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0);'
);

// Updates: You may want to allow updating the archived flag if needed
export const updateCar: Statement = db.prepare(
  'UPDATE cars SET name = ?, archived = ? WHERE carId = ?;'
);
export const updateTrack: Statement = db.prepare(
  'UPDATE tracks SET name = ?, length = ?, archived = ? WHERE trackId = ?;'
);
export const updateTire: Statement = db.prepare(
  'UPDATE tires SET name = ?, allowedLf = ?, allowedRf = ?, allowedLr = ?, allowedRr = ?, archived = ? WHERE tireId = ?;'
);
export const updateStint: Statement = db.prepare(
  'UPDATE stints SET trackId = ?, date = ?, laps = ?, leftFront = ?, rightFront = ?, leftRear = ?, rightRear = ?, note = ?, archived = ? WHERE stintId = ?;'
);

// Archive instead of delete: Set archived = 1
export const archiveCarId: Statement = db.prepare('UPDATE cars SET archived = 1 WHERE carId = ?;');
export const archiveTrackId: Statement = db.prepare(
  'UPDATE tracks SET archived = 1 WHERE trackId = ?;'
);
export const archiveTireId: Statement = db.prepare(
  'UPDATE tires SET archived = 1 WHERE tireId = ?;'
);
export const archiveStintId: Statement = db.prepare(
  'UPDATE stints SET archived = 1 WHERE stintId = ?;'
);
export const archiveTiresByCar: Statement = db.prepare(
  'UPDATE tires SET archived = 1 WHERE carId = ?;'
);
export const archiveStintsByCar: Statement = db.prepare(
  'UPDATE stints SET archived = 1 WHERE carId = ?;'
);
export const archiveStintsByTrackId: Statement = db.prepare(
  'UPDATE stints SET archived = 1 WHERE trackId = ?;'
);

// Restore resources
export const restoreTireId: Statement = db.prepare(
  'UPDATE tires SET archived = 0 WHERE tireId = ?;'
);
export const restoreTrackId: Statement = db.prepare(
  'UPDATE tracks SET archived = 0 WHERE trackId = ?;'
);
export const restoreCarId: Statement = db.prepare('UPDATE cars SET archived = 0 WHERE carId = ?;');
export const restoreStintId: Statement = db.prepare(
  'UPDATE stints SET archived = 0 WHERE stintId = ?;'
);

// Permanent delete (if needed)
export const deleteCarId: Statement = db.prepare('DELETE FROM cars WHERE carId = ?;');
export const deleteTrackId: Statement = db.prepare('DELETE FROM tracks WHERE trackId = ?;');
export const deleteTireId: Statement = db.prepare('DELETE FROM tires WHERE tireId = ?;');
export const deleteStintId: Statement = db.prepare('DELETE FROM stints WHERE stintId = ?;');

export const getAllTableNames: Statement<[], { name: string }> = db.prepare(
  "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
);

export const getQueryAllTables = (tableNames: string[]) => {
  const exportData = {};
  tableNames.forEach((name) => {
    const rows = db.prepare(`SELECT * FROM ${name}`).all();
    exportData[name] = rows;
    console.log(`Exported ${rows.length} rows from ${name}`);
  });
  return exportData;
};

export function importData(data: any) {
  // Start transaction for atomic import
  const transaction = db.transaction(() => {
    // Handle different data formats
    if (data.data) {
      // If exported with metadata (version, exportDate, etc.)
      importTables(data.data);
    } else {
      // Direct table data
      importTables(data);
    }
  });

  transaction();
}

function importTables(tableData: Record<string, any[]>) {
  for (const [tableName, rows] of Object.entries(tableData)) {
    if (!Array.isArray(rows) || rows.length === 0) continue;

    // Get column names from first row
    const columns = Object.keys(rows[0]);
    const placeholders = columns.map(() => '?').join(', ');

    // Prepare insert statement
    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO ${tableName} (${columns.join(', ')}) 
      VALUES (${placeholders})
    `);

    // Insert all rows
    for (const row of rows) {
      const values = columns.map((col) => row[col]);
      insertStmt.run(...values);
    }

    console.log(`Imported ${rows.length} rows into ${tableName}`);
  }
}

export function importDataWithOptions(
  data: any,
  options: {
    conflictResolution: 'replace' | 'ignore' | 'fail' | 'merge';
    clearExisting?: boolean;
  }
) {
  const transaction = db.transaction(() => {
    const tableData = data.data || data;

    for (const [tableName, rows] of Object.entries(tableData)) {
      if (!Array.isArray(rows) || rows.length === 0) continue;

      // Clear existing data if requested
      if (options.clearExisting) {
        db.prepare(`DELETE FROM ${tableName}`).run();
      }

      const columns = Object.keys(rows[0]);

      if (options.conflictResolution === 'merge') {
        handleMergeImport(db, tableName, rows, columns);
      } else {
        handleStandardImport(db, tableName, rows, columns, options.conflictResolution);
      }
    }
  });

  transaction();
}

function handleStandardImport(
  db: any,
  tableName: string,
  rows: any[],
  columns: string[],
  conflictResolution: string
) {
  const placeholders = columns.map(() => '?').join(', ');

  let insertQuery = '';
  switch (conflictResolution) {
    case 'replace':
      insertQuery = `INSERT OR REPLACE INTO ${tableName}`;
      break;
    case 'ignore':
      insertQuery = `INSERT OR IGNORE INTO ${tableName}`;
      break;
    case 'fail':
    default:
      insertQuery = `INSERT INTO ${tableName}`;
      break;
  }

  const insertStmt = db.prepare(`
    ${insertQuery} (${columns.join(', ')}) 
    VALUES (${placeholders})
  `);

  for (const row of rows) {
    const values = columns.map((col) => row[col]);
    insertStmt.run(...values);
  }
}

function handleMergeImport(db: any, tableName: string, rows: any[], columns: string[]) {
  // Get primary key column(s) for the table
  const primaryKeys = getPrimaryKeys(db, tableName);

  for (const row of rows) {
    // Check if record exists
    const existingRecord = findExistingRecord(db, tableName, row, primaryKeys);

    if (existingRecord) {
      // Merge: Update with new data, keeping existing data for null/undefined fields
      const mergedData = mergeRecords(existingRecord, row);
      updateRecord(db, tableName, mergedData, primaryKeys);
    } else {
      // Insert new record
      insertRecord(db, tableName, row, columns);
    }
  }

  console.log(`Merged ${rows.length} rows into ${tableName}`);
}

function getPrimaryKeys(db: any, tableName: string): string[] {
  const pragma = db.prepare(`PRAGMA table_info(${tableName})`).all();
  return pragma.filter((col) => col.pk === 1).map((col) => col.name);
}

function findExistingRecord(db: any, tableName: string, row: any, primaryKeys: string[]) {
  if (primaryKeys.length === 0) {
    // If no primary key, use all columns to find duplicates
    const whereClause = Object.keys(row)
      .map((col) => `${col} = ?`)
      .join(' AND ');
    const values = Object.values(row);
    return db.prepare(`SELECT * FROM ${tableName} WHERE ${whereClause}`).get(...values);
  }

  // Use primary key(s) to find existing record
  const whereClause = primaryKeys.map((key) => `${key} = ?`).join(' AND ');
  const values = primaryKeys.map((key) => row[key]);
  return db.prepare(`SELECT * FROM ${tableName} WHERE ${whereClause}`).get(...values);
}

function mergeRecords(existingRecord: any, newRecord: any) {
  const merged = { ...existingRecord };

  // Merge strategy: new data overwrites existing, but only if new value is not null/undefined
  for (const [key, value] of Object.entries(newRecord)) {
    if (value !== null && value !== undefined && value !== '') {
      merged[key] = value;
    }
    // Keep existing value if new value is null/undefined/empty
  }

  return merged;
}

function updateRecord(db: any, tableName: string, record: any, primaryKeys: string[]) {
  const columns = Object.keys(record);
  const setClause = columns
    .filter((col) => !primaryKeys.includes(col))
    .map((col) => `${col} = ?`)
    .join(', ');
  const whereClause = primaryKeys.map((key) => `${key} = ?`).join(' AND ');

  const updateValues = columns
    .filter((col) => !primaryKeys.includes(col))
    .map((col) => record[col]);
  const whereValues = primaryKeys.map((key) => record[key]);

  db.prepare(`UPDATE ${tableName} SET ${setClause} WHERE ${whereClause}`).run(
    ...updateValues,
    ...whereValues
  );
}

function insertRecord(db: any, tableName: string, record: any, columns: string[]) {
  const placeholders = columns.map(() => '?').join(', ');
  const values = columns.map((col) => record[col]);

  db.prepare(`INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`).run(
    ...values
  );
}
export function migrateAddArchivedFlag(db: BetterSqlite3Database) {
  const tables = ['cars', 'tires', 'stints', 'tracks'];
  for (const table of tables) {
    // Check if 'archived' column exists
    const columns = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
    const hasArchived = columns.some((col) => col.name === 'archived');
    if (!hasArchived) {
      db.prepare(`ALTER TABLE ${table} ADD COLUMN archived INTEGER DEFAULT 0`).run();
      console.log(`Added 'archived' column to ${table}`);
    }
  }
}
