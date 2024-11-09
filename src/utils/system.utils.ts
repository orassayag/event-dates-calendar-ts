import { GlobalUtils } from '.';
import { SETTINGS } from '../settings';
import { Status } from '../types';
import LogUtils from './log.utils';

class SystemUtils {
  public async exit(status: Status): Promise<void> {
    if (!status) {
      throw new Error(`Missing status: ${status} (1000001)`);
    }
    await GlobalUtils.sleep(SETTINGS.COUNT_AND_LIMIT.EXIT_DELAY);
    LogUtils.logMessage(`EXIT: ${status}`);
    process.exit(0);
  }
}

export default new SystemUtils();
