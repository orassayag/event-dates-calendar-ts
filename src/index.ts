import { initiate } from './settings';

initiate();

const { createScript } = await import('./scripts');
await createScript.run();
