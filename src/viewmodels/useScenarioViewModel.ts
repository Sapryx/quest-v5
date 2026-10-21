import { useMemo } from 'react';
import { findActivePlaythrough, useQuestStore } from '@/store/questStore';

export type StageState = 'done' | 'current' | 'locked';

export function useScenarioViewModel(id: string) {
  const scenario = useQuestStore((s) => s.scenarios.find((sc) => sc.id === id));
  const playthroughs = useQuestStore((s) => s.playthroughs);
  const startPlaythrough = useQuestStore((s) => s.startPlaythrough);

  const active = findActivePlaythrough(playthroughs, id);

  const stages = useMemo(
    () =>
      (scenario?.stages ?? []).map((stage, index) => {
        const reached = active?.stageIndex ?? 0;
        const state: StageState = !active ? 'locked' : index < reached ? 'done' : index === reached ? 'current' : 'locked';
        return { stage, index, state };
      }),
    [scenario, active],
  );

  const history = useMemo(
    () =>
      playthroughs
        .filter((p) => p.scenarioId === id && p.finishedAt !== null)
        .sort((a, b) => b.startedAt - a.startedAt)
        .map((p) => ({ id: p.id, finishedAt: p.finishedAt!, duration: p.finishedAt! - p.startedAt, score: p.score })),
    [playthroughs, id],
  );

  return {
    scenario,
    activePlaythroughId: active?.id,
    stages,
    history,
    maxScore: scenario?.stages.reduce((sum, s) => sum + s.points, 0) ?? 0,
    start: () => startPlaythrough(id),
  };
}
