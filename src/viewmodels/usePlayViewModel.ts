import { useEffect, useState } from 'react';
import { filter, map, merge } from 'rxjs';
import { broker } from '@/broker/messageBroker';
import { stagePoints } from '@/models/quest';
import { useQuestStore } from '@/store/questStore';

export type ScanFeedback = { success: boolean; message: string };

export function usePlayViewModel(playthroughId: number) {
  const playthrough = useQuestStore((s) => s.playthroughs.find((p) => p.id === playthroughId));
  const scenario = useQuestStore((s) => s.scenarios.find((sc) => sc.id === playthrough?.scenarioId));
  const revealHint = useQuestStore((s) => s.revealHint);
  const [feedback, setFeedback] = useState<ScanFeedback>();

  useEffect(() => {
    const subscription = merge(
      broker.on('TagRejected').pipe(map((e) => ({ id: e.playthroughId, success: false, message: e.reason }))),
      broker.on('ProgressUpdated').pipe(
        map((e) => ({ id: e.playthroughId, success: true, message: `Метка принята! +${e.points} б.` })),
      ),
    )
      .pipe(filter((e) => e.id === playthroughId))
      .subscribe(({ success, message }) => setFeedback({ success, message }));
    return () => subscription.unsubscribe();
  }, [playthroughId]);

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
    feedback,
    revealHint: () => revealHint(playthroughId),
    clearFeedback: () => setFeedback(undefined),
  };
}
