import { Checkpoint, Player, Playthrough, Scenario } from '@/models/quest';
import { mockCheckpoints, mockPlayer, mockPlaythroughs, mockScenarios } from './mockData';

export type GameSnapshot = {
  player: Player;
  playthroughs: Playthrough[];
  checkpoints: Checkpoint[];
};

// Хранилище сценариев (только чтение)
export interface ScenarioRepository {
  getAll(): Promise<Scenario[]>;
}

// Профиль игрока, история прохождений и временные метки
export interface GameRepository {
  load(): Promise<GameSnapshot>;
  renamePlayer(name: string): Promise<void>;
  startPlaythrough(scenarioId: string): Promise<number>;
  useHint(playthroughId: number): Promise<void>;
  completeStage(playthroughId: number, stageId: string, points: number, isLast: boolean): Promise<void>;
}

export const scenarioRepository: ScenarioRepository = {
  getAll: async () => mockScenarios,
};

let player = { ...mockPlayer };
let playthroughs = [...mockPlaythroughs];
let checkpoints = [...mockCheckpoints];

const updatePlaythrough = (id: number, change: (p: Playthrough) => Playthrough) => {
  playthroughs = playthroughs.map((p) => (p.id === id ? change(p) : p));
};

export const gameRepository: GameRepository = {
  load: async () => ({ player, playthroughs, checkpoints }),
  renamePlayer: async (name) => {
    player = { name };
  },
  startPlaythrough: async (scenarioId) => {
    // Незавершённая игра по этому сценарию сбрасывается
    const abandoned = playthroughs.filter((p) => p.scenarioId === scenarioId && p.finishedAt === null).map((p) => p.id);
    playthroughs = playthroughs.filter((p) => !abandoned.includes(p.id));
    checkpoints = checkpoints.filter((c) => !abandoned.includes(c.playthroughId));
    const id = Math.max(0, ...playthroughs.map((p) => p.id)) + 1;
    playthroughs = [
      ...playthroughs,
      { id, scenarioId, startedAt: Date.now(), finishedAt: null, stageIndex: 0, score: 0, hintsUsed: 0 },
    ];
    return id;
  },
  useHint: async (playthroughId) => updatePlaythrough(playthroughId, (p) => ({ ...p, hintsUsed: p.hintsUsed + 1 })),
  completeStage: async (playthroughId, stageId, points, isLast) => {
    const now = Date.now();
    checkpoints = [
      ...checkpoints,
      { id: checkpoints.length + 1, playthroughId, stageId, points, reachedAt: now },
    ];
    updatePlaythrough(playthroughId, (p) => ({
      ...p,
      stageIndex: p.stageIndex + 1,
      score: p.score + points,
      hintsUsed: 0,
      finishedAt: isLast ? now : null,
    }));
  },
};
