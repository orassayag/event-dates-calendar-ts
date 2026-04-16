import { validateService, statisticsService, validationService } from '../services';
import { ValidationResult } from '../types';
import { logUtils, systemUtils } from '../utils';

class ValidateScript {
  /**
   * Runs the validate script: validates configuration, then runs validation.
   *
   * @returns Promise that resolves when the script completes
   */
  public async run(): Promise<void> {
    logUtils.logStatus('running: validate script');
    await validationService.run('validate');
    await this.validate();
  }

  /**
   * Executes the validation service and displays the results.
   *
   * @returns Promise that resolves when validation completes
   */
  private async validate(): Promise<void> {
    const result: ValidationResult = await validateService.validate();
    logUtils.logStatus('validation complete');
    await this.displayStatistics(result);
    systemUtils.exit('SCRIPT COMPLETE');
  }

  /**
   * Displays validation statistics: file stats, missing markers, and fixed lines.
   *
   * @param result - The validation result containing file paths, stats, and fixed lines
   * @returns Promise that resolves when display completes
   */
  private async displayStatistics(result: ValidationResult): Promise<void> {
    const { sourceFilePath, distFilePath, fixedLines, stats } = result;
    const sourceStats: any = await statisticsService['getFileStats'](sourceFilePath);
    const distStats: any = await statisticsService['getFileStats'](distFilePath);
    const divider: string = '='.repeat(33);
    logUtils.log(divider);
    logUtils.logStatus(`source file: ${sourceStats.fileName.toUpperCase()}`);
    logUtils.logStatus(`size: ${sourceStats.size} | days: ${this.formatNumber(sourceStats.days)}`);
    logUtils.logStatus(`lines: ${this.formatNumber(sourceStats.lines)} | events: ${this.formatNumber(sourceStats.events)}`);
    logUtils.log(divider);
    logUtils.logStatus(`dist file: ${distStats.fileName.toUpperCase()}`);
    logUtils.logStatus(`size: ${distStats.size} | days: ${this.formatNumber(distStats.days)}`);
    logUtils.logStatus(`lines: ${this.formatNumber(distStats.lines)} | events: ${this.formatNumber(distStats.events)}`);
    logUtils.logStatus(`missing start: ${stats.missingStart} | missing end: ${stats.missingEnd}`);
    logUtils.logStatus(`duplicate lines removed: ${stats.duplicateLinesRemoved}`);
    logUtils.logStatus(`fixed lines count: ${stats.fixedLinesCount}`);
    if (fixedLines.length > 0) {
      logUtils.logStatus('fixed lines');
      for (const fixedLine of fixedLines) {
        logUtils.log(`Line ${fixedLine.lineNumber}: ${fixedLine.fixedText}`);
      }
    }
    logUtils.log(divider);
  }

  /**
   * Formats a number with locale-specific thousands separators.
   *
   * @param num - The number to format
   * @returns Formatted number string (e.g., "1,234")
   */
  private formatNumber(num: number): string {
    return num.toLocaleString('en-US');
  }
}

export default new ValidateScript();
