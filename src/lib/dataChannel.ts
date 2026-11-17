const CHANNEL_NAME = 'med-tracker-data';
const CHANGED_MESSAGE = 'changed';

// IndexedDB has no change events, so tabs tell each other when they write. Each tab then reloads
// its snapshot, keeping two open windows (or the installed app and a browser tab) in step.
const channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CHANNEL_NAME);

export function announceDataChanged(): void {
  channel?.postMessage(CHANGED_MESSAGE);
}

export function subscribeToDataChanges(onChange: () => void): () => void {
  if (channel === null) return () => undefined;
  const listener = (event: MessageEvent) => {
    if (event.data === CHANGED_MESSAGE) onChange();
  };
  channel.addEventListener('message', listener);
  return () => channel.removeEventListener('message', listener);
}
