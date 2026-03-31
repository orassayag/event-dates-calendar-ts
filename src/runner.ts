import { initiate } from './settings';

const scriptName: string = process.argv[2];

if (!scriptName) {
  console.error('Error: No script name provided');
  console.error('Usage: pnpm run script <script-name>');
  process.exit(1);
}

initiate();

try {
  const scriptModule = await import(`./scripts/${scriptName}.js`);
  if (!scriptModule.default || typeof scriptModule.default.run !== 'function') {
    console.error(`Error: Script "${scriptName}" does not export a valid script object with a run() method`);
    process.exit(1);
  }
  await scriptModule.default.run();
} catch (error) {
  if (error.code === 'ERR_MODULE_NOT_FOUND') {
    console.error(`Error: Script "${scriptName}" not found in src/scripts/`);
    console.error('Available scripts: create, sync, validate, stop-counter, search');
  } else {
    console.error(`Error running script "${scriptName}":`, error);
  }
  process.exit(1);
}
