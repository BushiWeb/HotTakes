import { nextTick } from 'node:process';

export const flushPromise = () => new Promise(nextTick);
