import { useRef } from 'react';
import { broker } from '@/broker/messageBroker';

export function useScannerViewModel(playthroughId: number) {
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
