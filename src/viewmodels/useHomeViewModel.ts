import { useMemo } from 'react';
import { Scenario } from '@/models/quest';
import { findActivePlaythrough, useQuestStore } from '@/store/questStore';
import { formatDuration } from '@/utils/format';

export type ScenarioSummary = { scenario: Scenario; status: string; progress: number };

export type JournalEntry = {
  id: number;
  stageTitle: string;
  scenarioTitle: string;
  reachedAt: number;
  duration: number;
  points: number;
};

export function useHomeViewModel() {
  const scenarios = useQuestStore((s) => s.scenarios);
  const player = useQuestStore((s) => s.player);
  const playthroughs = useQuestStore((s) => s.playthroughs);
  const checkpoints = useQuestStore((s) => s.checkpoints);
  const loaded = useQuestStore((s) => s.loaded);
  const renamePlayer = useQuestStore((s) => s.renamePlayer);

  const summaries = useMemo<ScenarioSummary[]>(
    () =>
      scenarios.map((scenario) => {
        const total = scenario.stages.length;
        const active = findActivePlaythrough(playthroughs, scenario.id);
        if (active) {
          return {
            scenario,
            status: `В процессе: этап ${active.stageIndex + 1} из ${total} · ${active.score} б.`,
            progress: active.stageIndex / total,
          };
        }
        const finished = playthroughs.filter((p) => p.scenarioId === scenario.id && p.finishedAt !== null);
        if (finished.length > 0) {
          const best = finished.reduce((a, b) => (b.score > a.score ? b : a));
          return {
            scenario,
            status: `Пройден · лучший результат ${best.score} б. за ${formatDuration(best.finishedAt! - best.startedAt)}`,
            progress: 1,
          };
        }
        return { scenario, status: `Не начат · этапов: ${total}`, progress: 0 };
      }),
    [scenarios, playthroughs],
  );

  // Журнал: каждая пройденная метка и время, затраченное на этап
  const journal = useMemo<JournalEntry[]>(() => {
    const entries = checkpoints.map((checkpoint) => {
      const playthrough = playthroughs.find((p) => p.id === checkpoint.playthroughId);
      const scenario = scenarios.find((s) => s.id === playthrough?.scenarioId);
      const previous = checkpoints
        .filter((c) => c.playthroughId === checkpoint.playthroughId && c.reachedAt < checkpoint.reachedAt)
        .reduce((latest, c) => Math.max(latest, c.reachedAt), playthrough?.startedAt ?? checkpoint.reachedAt);
      return {
        id: checkpoint.id,
        stageTitle: scenario?.stages.find((s) => s.id === checkpoint.stageId)?.title ?? checkpoint.stageId,
        scenarioTitle: scenario?.title ?? '',
        reachedAt: checkpoint.reachedAt,
        duration: checkpoint.reachedAt - previous,
        points: checkpoint.points,
      };
    });
    return entries.sort((a, b) => b.reachedAt - a.reachedAt).slice(0, 20);
  }, [scenarios, playthroughs, checkpoints]);

  return {
    loaded,
    player,
    totalScore: playthroughs.reduce((sum, p) => sum + p.score, 0),
    completedCount: playthroughs.filter((p) => p.finishedAt !== null).length,
    summaries,
    journal,
    renamePlayer: async (name: string) => {
      if (name.trim()) await renamePlayer(name.trim());
    },
  };
}
