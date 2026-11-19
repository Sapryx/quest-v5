import * as Crypto from 'expo-crypto';
import { catchError, concatMap, from, of } from 'rxjs';
import { gameRepository } from '@/data/gameRepository';
import { scenarioRepository } from '@/data/scenarioRepository';
import { stagePoints } from '@/models/quest';
import { EventOf, MessageBroker, QuestEvent } from './messageBroker';

async function validate({ playthroughId, code }: EventOf<'TagScanned'>): Promise<QuestEvent> {
  const reject = (reason: string): QuestEvent => ({ type: 'TagRejected', playthroughId, reason });

  const playthrough = await gameRepository.getPlaythrough(playthroughId);
  if (!playthrough || playthrough.finishedAt !== null) return reject('Игра уже завершена');

  const scenario = await scenarioRepository.get(playthrough.scenarioId);
  const stage = scenario?.stages[playthrough.stageIndex];
  if (!scenario || !stage) return reject('Сценарий не найден');

  const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, code.trim());
  if (hash !== stage.answerHash) return reject('Эта метка не относится к текущему этапу');

  return {
    type: 'TagAccepted',
    playthroughId,
    stageIndex: playthrough.stageIndex,
    stageId: stage.id,
    points: stagePoints(stage, playthrough.hintsUsed),
    isLast: playthrough.stageIndex === scenario.stages.length - 1,
  };
}

export function startTagValidator(broker: MessageBroker) {
  return broker
    .on('TagScanned')
    .pipe(
      concatMap((event) =>
        from(validate(event)).pipe(
          catchError((error) =>
            of<QuestEvent>({ type: 'TagRejected', playthroughId: event.playthroughId, reason: String(error) }),
          ),
        ),
      ),
    )
    .subscribe((result) => broker.publish(result));
}
