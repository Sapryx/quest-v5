import { Subscription } from 'rxjs';
import { broker } from './messageBroker';
import { startProgressRecorder } from './progressRecorder';
import { startTagValidator } from './tagValidator';

export function startQuestPipeline(onProgress: () => void) {
  const subscription = new Subscription();
  subscription.add(startTagValidator(broker));
  subscription.add(startProgressRecorder(broker));
  subscription.add(broker.on('ProgressUpdated').subscribe(onProgress));
  return subscription;
}
