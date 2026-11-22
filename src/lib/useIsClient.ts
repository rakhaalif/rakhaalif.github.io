import { useSyncExternalStore } from 'react';

const noop = () => () => {};

/** False on the server and while hydrating the prerendered page, true after: for output only the browser can know. */
export const useIsClient = () => useSyncExternalStore(noop, () => true, () => false);
