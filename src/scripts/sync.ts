import { syncService, statisticsService, validationService } from '../services';
import { SyncResult } from '../types';
import { logUtils, systemUtils } from '../utils';

class SyncScript {
  /**
   * Runs the sync script: validates configuration, then syncs event files.
   *
   * @returns Promise that resolves when the script completes
   */
  public async run(): Promise<void> {
    logUtils.logStatus('running: sync script');
    await validationService.run('sync');
    await this.sync();
  }

  /**
   * Executes the sync service and displays sync statistics.
   *
   * @returns Promise that resolves when the sync completes
   */
  private async sync(): Promise<void> {
    const result: SyncResult = await syncService.sync();
    logUtils.logStatus('sync completed successfully');
    await statisticsService.displaySyncStatistics(
      result.sourceFilePath,
      result.archiveFilePath,
      result.distFilePath,
      result.syncedDays,
      result.unsyncedDays,
      result.appliedCounters
    );
    systemUtils.exit('SCRIPT COMPLETE');
  }
}

export default new SyncScript();
