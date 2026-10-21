import { Checkpoint, Player, Playthrough } from '@/models/quest';
import { db } from './database';

export type GameSnapshot = {
  player: Player;
  playthroughs: Playthrough[];
  checkpoints: Checkpoint[];
};

// Профиль игрока, история прохождений и временные метки (реляционная БД)
export const gameRepository = {
  async load(): Promise<GameSnapshot> {
    const [player, playthroughs, checkpoints] = await Promise.all([
      db.getFirstAsync<Player>('SELECT name FROM player WHERE id = 1'),
      db.getAllAsync<Playthrough>(
        `SELECT id, scenario_id AS scenarioId, started_at AS startedAt, finished_at AS finishedAt,
                stage_index AS stageIndex, score, hints_used AS hintsUsed
         FROM playthroughs ORDER BY started_at`,
      ),
      db.getAllAsync<Checkpoint>(
        `SELECT id, playthrough_id AS playthroughId, stage_id AS stageId, points, reached_at AS reachedAt
         FROM checkpoints ORDER BY reached_at`,
      ),
    ]);
    return { player: player ?? { name: 'Игрок' }, playthroughs, checkpoints };
  },

  async getPlaythrough(id: number) {
    return db.getFirstAsync<Playthrough>(
      `SELECT id, scenario_id AS scenarioId, started_at AS startedAt, finished_at AS finishedAt,
              stage_index AS stageIndex, score, hints_used AS hintsUsed
       FROM playthroughs WHERE id = ?`,
      id,
    );
  },

  async renamePlayer(name: string) {
    await db.runAsync('UPDATE player SET name = ? WHERE id = 1', name);
  },

  async startPlaythrough(scenarioId: string) {
    let id = 0;
    await db.withExclusiveTransactionAsync(async (txn) => {
      // Незавершённая игра по этому сценарию сбрасывается вместе с её отметками (каскадно)
      await txn.runAsync('DELETE FROM playthroughs WHERE scenario_id = ? AND finished_at IS NULL', scenarioId);
      const result = await txn.runAsync(
        'INSERT INTO playthroughs (scenario_id, started_at) VALUES (?, ?)',
        scenarioId,
        Date.now(),
      );
      id = result.lastInsertRowId;
    });
    return id;
  },

  async useHint(playthroughId: number) {
    await db.runAsync('UPDATE playthroughs SET hints_used = hints_used + 1 WHERE id = ?', playthroughId);
  },

  async completeStage(playthroughId: number, stageIndex: number, stageId: string, points: number, isLast: boolean) {
    const now = Date.now();
    await db.withExclusiveTransactionAsync(async (txn) => {
      // Условие по stage_index не даёт засчитать один и тот же этап дважды
      const result = await txn.runAsync(
        `UPDATE playthroughs
         SET stage_index = stage_index + 1, score = score + ?, hints_used = 0, finished_at = ?
         WHERE id = ? AND stage_index = ? AND finished_at IS NULL`,
        points,
        isLast ? now : null,
        playthroughId,
        stageIndex,
      );
      if (result.changes === 0) throw new Error('этап уже засчитан');
      await txn.runAsync(
        'INSERT INTO checkpoints (playthrough_id, stage_id, points, reached_at) VALUES (?, ?, ?, ?)',
        playthroughId,
        stageId,
        points,
        now,
      );
    });
  },
};
