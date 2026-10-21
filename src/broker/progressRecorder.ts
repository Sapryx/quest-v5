import { catchError, concatMap, EMPTY, from, map } from 'rxjs';
import { gameRepository } from '@/data/gameRepository';
import { MessageBroker, QuestEvent } from './messageBroker';

// Записывает подтверждённое прохождение этапа в базу данных и сообщает об обновлении прогресса
export function startProgressRecorder(broker: MessageBroker) {
  return broker
    .on('TagAccepted')
    .pipe(
      concatMap(({ playthroughId, stageIndex, stageId, points, isLast }) =>
        from(gameRepository.completeStage(playthroughId, stageIndex, stageId, points, isLast)).pipe(
          map((): QuestEvent => ({ type: 'ProgressUpdated', playthroughId, points, finished: isLast })),
          catchError((error) => {
            broker.publish({ type: 'TagRejected', playthroughId, reason: `Не удалось сохранить прогресс: ${error instanceof Error ? error.message : error}` });
            return EMPTY;
          }),
        ),
      ),
    )
    .subscribe((event) => broker.publish(event));
}
