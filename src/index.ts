import { createScript } from './scripts';
import { initiate } from './settings';

initiate();
// eslint-disable-next-line @typescript-eslint/no-floating-promises
createScript.run();
