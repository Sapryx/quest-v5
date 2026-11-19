export type Stage = {
  id: string;
  title: string;
  riddle: string;
  hints: string[];
  condition: string;
  answerHash: string;
  points: number;
};

export type Scenario = {
  id: string;
  title: string;
  description: string;
  icon: string;
  stages: Stage[];
};

export type Player = {
  name: string;
};

export type Playthrough = {
  id: number;
  scenarioId: string;
  startedAt: number;
  finishedAt: number | null;
  stageIndex: number;
  score: number;
  hintsUsed: number;
};

export type Checkpoint = {
  id: number;
  playthroughId: number;
  stageId: string;
  points: number;
  reachedAt: number;
};

export const HINT_PENALTY = 5;

export const stagePoints = (stage: Stage, hintsUsed: number) => Math.max(stage.points - hintsUsed * HINT_PENALTY, 0);
