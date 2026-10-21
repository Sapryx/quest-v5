import { filter, Observable, Subject } from 'rxjs';

export type QuestEvent =
  // Сканер обнаружил метку
  | { type: 'TagScanned'; playthroughId: number; code: string }
  // Валидатор подтвердил, что метка соответствует текущему этапу
  | { type: 'TagAccepted'; playthroughId: number; stageIndex: number; stageId: string; points: number; isLast: boolean }
  // Валидатор отклонил метку
  | { type: 'TagRejected'; playthroughId: number; reason: string }
  // Прогресс сохранён в базе данных
  | { type: 'ProgressUpdated'; playthroughId: number; points: number; finished: boolean };

export type QuestEventType = QuestEvent['type'];
export type EventOf<T extends QuestEventType> = Extract<QuestEvent, { type: T }>;

// Брокер сообщений: модули не знают друг о друге и общаются только через события
export class MessageBroker {
  private readonly bus = new Subject<QuestEvent>();

  publish(event: QuestEvent) {
    this.bus.next(event);
  }

  on<T extends QuestEventType>(type: T): Observable<EventOf<T>> {
    return this.bus.pipe(filter((event): event is EventOf<T> => event.type === type));
  }
}

export const broker = new MessageBroker();
