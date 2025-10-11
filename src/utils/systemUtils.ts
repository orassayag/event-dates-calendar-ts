import { logUtils } from './logUtils';

class SystemUtils {
  public exit(reason: string): void {
    logUtils.logStatus(`EXIT: ${reason}`);
    process.exit(0);
  }
}

const systemUtils: SystemUtils = new SystemUtils();
export { systemUtils };
