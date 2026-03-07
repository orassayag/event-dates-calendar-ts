import { stopCounterService, statisticsService, validationService } from '../services';
import { StopCounterResult } from '../types';
import { logUtils, systemUtils } from '../utils';

class StopCounterScript {
  /**
   * Runs the stop counter script: validates configuration, then stops the counter.
   *
   * @returns Promise that resolves when the script completes
   */
  public async run(): Promise<void> {
    logUtils.logStatus('running: stop counter script');
    await validationService.run('stop-counter');
    await this.stopCounter();
  }

  /**
   * Executes the stop counter service and displays statistics.
   *
   * @returns Promise that resolves when the stop counter completes
   */
  private async stopCounter(): Promise<void> {
    const result: StopCounterResult = await stopCounterService.stopCounter();
    logUtils.logStatus('stop counter completed successfully');
    await statisticsService.displayStopCounterStatistics(result);
    systemUtils.exit('SCRIPT COMPLETE');
  }
}

export default new StopCounterScript();
