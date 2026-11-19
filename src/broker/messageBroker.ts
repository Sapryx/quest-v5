import { filter, Observable, Subject } from 'rxjs';

export type QuestEvent =
  | { type: 'TagScanned'; playthroughId: number; code: string }
  | { type: 'TagAccepted'; playthroughId: number; stageIndex: number; stageId: string; points: number; isLast: boolean }
  | { type: 'TagRejected'; playthroughId: number; reason: string }
  | { type: 'ProgressUpdated'; playthroughId: number; points: number; finished: boolean };

export type QuestEventType = QuestEvent['type'];
export type EventOf<T extends QuestEventType> = Extract<QuestEvent, { type: T }>;

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
