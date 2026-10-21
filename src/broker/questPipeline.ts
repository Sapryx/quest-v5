import { Subscription } from 'rxjs';
import { broker } from './messageBroker';
import { startProgressRecorder } from './progressRecorder';
import { startTagValidator } from './tagValidator';

// Подключает модули к брокеру: сканер → валидатор → запись прогресса → интерфейс
export function startQuestPipeline(onProgress: () => void) {
  const subscription = new Subscription();
  subscription.add(startTagValidator(broker));
  subscription.add(startProgressRecorder(broker));
  subscription.add(broker.on('ProgressUpdated').subscribe(onProgress));
  return subscription;
}
