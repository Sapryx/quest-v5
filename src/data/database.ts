import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

export let db: SQLite.SQLiteDatabase;

const migrations: string[] = [
  `
  CREATE TABLE player (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    name TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  INSERT INTO player (id, name, created_at) VALUES (1, 'Игрок', CAST(strftime('%s', 'now') AS INTEGER) * 1000);

  CREATE TABLE playthroughs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL DEFAULT 1 REFERENCES player(id) ON DELETE CASCADE,
    scenario_id TEXT NOT NULL,
    started_at INTEGER NOT NULL,
    finished_at INTEGER,
    stage_index INTEGER NOT NULL DEFAULT 0,
    score INTEGER NOT NULL DEFAULT 0,
    hints_used INTEGER NOT NULL DEFAULT 0
  );
  CREATE INDEX idx_playthroughs_scenario ON playthroughs(scenario_id);

  CREATE TABLE checkpoints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    playthrough_id INTEGER NOT NULL REFERENCES playthroughs(id) ON DELETE CASCADE,
    stage_id TEXT NOT NULL,
    points INTEGER NOT NULL,
    reached_at INTEGER NOT NULL
  );
  CREATE INDEX idx_checkpoints_playthrough ON checkpoints(playthrough_id);
  `,
];

export function inTransaction(task: (txn: SQLite.SQLiteDatabase) => Promise<void>) {
  return Platform.OS === 'web' ? db.withTransactionAsync(() => task(db)) : db.withExclusiveTransactionAsync(task);
}

export async function openDatabase() {
  db = await SQLite.openDatabaseAsync('quest.db');
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const version = row?.user_version ?? 0;

  for (const [index, sql] of migrations.slice(version).entries()) {
    await inTransaction(async (txn) => {
      await txn.execAsync(sql);
      await txn.execAsync(`PRAGMA user_version = ${version + index + 1}`);
    });
  }
}
