import { stagePoints } from '@/models/quest';
import { useQuestStore } from '@/store/questStore';

export function usePlayViewModel(playthroughId: number) {
  const playthrough = useQuestStore((s) => s.playthroughs.find((p) => p.id === playthroughId));
  const scenario = useQuestStore((s) => s.scenarios.find((sc) => sc.id === playthrough?.scenarioId));
  const revealHint = useQuestStore((s) => s.revealHint);

  const stage = playthrough && scenario ? scenario.stages[playthrough.stageIndex] : undefined;
  const hintsUsed = playthrough?.hintsUsed ?? 0;

  return {
    playthrough,
    scenario,
    stage,
    stageNumber: (playthrough?.stageIndex ?? 0) + 1,
    stageCount: scenario?.stages.length ?? 0,
    finished: playthrough?.finishedAt != null,
    totalTime: playthrough?.finishedAt != null ? playthrough.finishedAt - playthrough.startedAt : 0,
    shownHints: stage?.hints.slice(0, hintsUsed) ?? [],
    canRevealHint: stage !== undefined && hintsUsed < stage.hints.length,
    availablePoints: stage ? stagePoints(stage, hintsUsed) : 0,
    revealHint: () => revealHint(playthroughId),
  };
}
