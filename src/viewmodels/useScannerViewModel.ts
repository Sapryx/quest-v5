import { useRef } from 'react';
import { broker } from '@/broker/messageBroker';

export function useScannerViewModel(playthroughId: number) {
  // Камера присылает один и тот же код много раз подряд — публикуем только первый
  const published = useRef(false);

  return {
    submit: (code: string) => {
      if (published.current) return false;
      published.current = true;
      broker.publish({ type: 'TagScanned', playthroughId, code });
      return true;
    },
  };
}
