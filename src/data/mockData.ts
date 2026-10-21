import { Checkpoint, Player, Playthrough, Scenario } from '@/models/quest';
import scenariosJson from './scenarios.json';

const now = Date.now();
const minute = 60_000;

export const mockScenarios = scenariosJson as Scenario[];

export const mockPlayer: Player = { name: 'Игрок' };

export const mockPlaythroughs: Playthrough[] = [
  { id: 1, scenarioId: 'home', startedAt: now - 30 * minute, finishedAt: null, stageIndex: 2, score: 40, hintsUsed: 0 },
];

export const mockCheckpoints: Checkpoint[] = [
  { id: 1, playthroughId: 1, stageId: 'home-1', points: 20, reachedAt: now - 24 * minute },
  { id: 2, playthroughId: 1, stageId: 'home-2', points: 20, reachedAt: now - 11 * minute },
];
