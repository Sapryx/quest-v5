import { create } from 'zustand';
import { gameRepository, scenarioRepository } from '@/data/repositories';
import { Checkpoint, Player, Playthrough, Scenario } from '@/models/quest';

type QuestState = {
  scenarios: Scenario[];
  player: Player;
  playthroughs: Playthrough[];
  checkpoints: Checkpoint[];
  loaded: boolean;
  start: () => Promise<void>;
  reload: () => Promise<void>;
  renamePlayer: (name: string) => Promise<void>;
  startPlaythrough: (scenarioId: string) => Promise<number>;
  revealHint: (playthroughId: number) => Promise<void>;
};

// Единый источник данных для всех ViewModel
export const useQuestStore = create<QuestState>((set, get) => {
  const mutate =
    <A extends unknown[], R>(action: (...args: A) => Promise<R>) =>
    async (...args: A) => {
      const result = await action(...args);
      await get().reload();
      return result;
    };

  return {
    scenarios: [],
    player: { name: '' },
    playthroughs: [],
    checkpoints: [],
    loaded: false,
    start: async () => {
      set({ scenarios: await scenarioRepository.getAll() });
      await get().reload();
    },
    reload: async () => {
      set({ ...(await gameRepository.load()), loaded: true });
    },
    renamePlayer: mutate(gameRepository.renamePlayer),
    startPlaythrough: mutate(gameRepository.startPlaythrough),
    revealHint: mutate(gameRepository.useHint),
  };
});

// Текущая (незавершённая) игра по сценарию
export const findActivePlaythrough = (playthroughs: Playthrough[], scenarioId: string) =>
  playthroughs.findLast((p) => p.scenarioId === scenarioId && p.finishedAt === null);
