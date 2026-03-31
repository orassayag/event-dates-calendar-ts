import { logUtils } from './logUtils';

class SystemUtils {
  /**
   * Logs the exit reason and terminates the process with code 0.
   *
   * @param reason - The reason for exiting (e.g., "SCRIPT COMPLETE")
   * @returns void
   */
  public exit(reason: string): void {
    logUtils.logStatus(`exit: ${reason}`);
    process.exit(0);
  }
}

const systemUtils: SystemUtils = new SystemUtils();
export { systemUtils };
