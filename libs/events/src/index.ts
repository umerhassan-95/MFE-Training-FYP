import type { NisumEventMap, NisumEventName } from '@meridian/shared-types';

export type EventHandler<K extends NisumEventName> = (
  payload: NisumEventMap[K]
) => void;

export interface NisumBus {
  emit<K extends NisumEventName>(eventName: K, payload?: NisumEventMap[K]): void;
  listener<K extends NisumEventName>(
    eventName: K,
    handler: EventHandler<K>
  ): () => void;
}

const PREFIX = 'nisum:';

function createBus(): NisumBus {
  const emit: NisumBus['emit'] = (eventName, payload) => {
    window.dispatchEvent(
      new CustomEvent(`${PREFIX}${eventName}`, { detail: payload })
    );
  };

  const listener: NisumBus['listener'] = (eventName, handler) => {
    const native = (event: Event) => {
      handler((event as CustomEvent).detail);
    };
    window.addEventListener(`${PREFIX}${eventName}`, native);
    return () => window.removeEventListener(`${PREFIX}${eventName}`, native);
  };

  return { emit, listener };
}

export function installNisum(): NisumBus {
  if (!window.NISUM) {
    window.NISUM = createBus();
  }
  return window.NISUM;
}

export function getNisum(): NisumBus {
  return installNisum();
}

declare global {
  interface Window {
    NISUM?: NisumBus;
  }
}
