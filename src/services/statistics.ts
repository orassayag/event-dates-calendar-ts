import { promises as fs } from 'fs';
import path from 'path';
import { FileStats, StopCounterResult, SyncCounterPattern } from '../types';
import { logUtils } from '../utils';

class StatisticsService {
  /**
   * Displays create statistics for source and dist files (size, days, lines, events).
   *
   * @param sourceFilePath - Path to the source file
   * @param distFilePath - Path to the distribution file
   */
  public async displayCreateStatistics(sourceFilePath: string, distFilePath: string): Promise<void> {
    const sourceStats: FileStats = await this.getFileStats(sourceFilePath);
    const distStats: FileStats = await this.getFileStats(distFilePath);
    const divider: string = '='.repeat(33);
    logUtils.log(divider);
    logUtils.logStatus(`source file: ${sourceStats.fileName}`);
    logUtils.logStatus(`size: ${sourceStats.size} | days: ${this.formatNumber(sourceStats.days)}`);
    logUtils.logStatus(`lines: ${this.formatNumber(sourceStats.lines)} | events: ${this.formatNumber(sourceStats.events)}`);
    logUtils.log(divider);
    logUtils.logStatus(`dist file: ${distStats.fileName}`);
    logUtils.logStatus(`size: ${distStats.size} | days: ${this.formatNumber(distStats.days)}`);
    logUtils.logStatus(`lines: ${this.formatNumber(distStats.lines)} | events: ${this.formatNumber(distStats.events)}`);
    logUtils.log(divider);
  }

  /**
   * Displays sync statistics for source, archive, dist files and synced/unsynced days.
   *
   * @param sourceFilePath - Path to the source file
   * @param archiveFilePath - Path to the archive file
   * @param distFilePath - Path to the distribution file
   * @param syncedDays - Array of date strings for synced days
   * @param unsyncedDays - Array of date strings for unsynced days
   */
  public async displaySyncStatistics(
    sourceFilePath: string,
    archiveFilePath: string,
    distFilePath: string,
    syncedDays: string[],
    unsyncedDays: string[],
    appliedCounters?: SyncCounterPattern[]
  ): Promise<void> {
    const sourceStats: FileStats = await this.getFileStats(sourceFilePath);
    const archiveStats: FileStats = await this.getFileStats(archiveFilePath);
    const distStats: FileStats = await this.getFileStats(distFilePath);
    const divider: string = '='.repeat(33);
    logUtils.log(divider);
    logUtils.logStatus(`source file: ${sourceStats.fileName}`);
    logUtils.logStatus(`size: ${sourceStats.size} | days: ${this.formatNumber(sourceStats.days)}`);
    logUtils.logStatus(`lines: ${this.formatNumber(sourceStats.lines)} | events: ${this.formatNumber(sourceStats.events)}`);
    logUtils.log(divider);
    logUtils.logStatus(`archive file: ${archiveStats.fileName}`);
    logUtils.logStatus(`size: ${archiveStats.size} | days: ${this.formatNumber(archiveStats.days)}`);
    logUtils.logStatus(`lines: ${this.formatNumber(archiveStats.lines)} | events: ${this.formatNumber(archiveStats.events)}`);
    logUtils.log(divider);
    logUtils.logStatus(`dist file: ${distStats.fileName}`);
    logUtils.logStatus(`size: ${distStats.size} | days: ${this.formatNumber(distStats.days)}`);
    logUtils.logStatus(`lines: ${this.formatNumber(distStats.lines)} | events: ${this.formatNumber(distStats.events)}`);
    logUtils.log(divider);
    if (appliedCounters && appliedCounters.length > 0) {
      logUtils.logStatus(`applied counters: ${appliedCounters.length}`);
      for (const counter of appliedCounters) {
        const exampleTask: string = counter.taskTemplate.trim();
        logUtils.log(`  - ${exampleTask.substring(0, 50)}${exampleTask.length > 50 ? '...' : ''}`);
      }
      logUtils.log(divider);
    }
    if (syncedDays.length > 0) {
      logUtils.logStatus(`synced days: ${syncedDays.length}`);
      for (const day of syncedDays) {
        logUtils.log(`  - ${day}`);
      }
      logUtils.log(divider);
    }
    if (unsyncedDays.length > 0) {
      logUtils.logStatus(`unsynced days: ${unsyncedDays.length}`);
      for (const day of unsyncedDays) {
        logUtils.log(`  - ${day}`);
      }
      logUtils.log(divider);
    }
    if (syncedDays.length === 0 && unsyncedDays.length === 0) {
      logUtils.logStatus('all days are already synced');
      logUtils.log(divider);
    }
  }

  /**
   * Displays stop-counter statistics for source and dist files with events matched/removed.
   *
   * @param result - StopCounterResult containing file paths and stats
   */
  public async displayStopCounterStatistics(result: StopCounterResult): Promise<void> {
    const { sourceFilePath, distFilePath, stats } = result;
    const sourceStats: FileStats = await this.getFileStats(sourceFilePath);
    const distStats: FileStats = await this.getFileStats(distFilePath);
    const divider: string = '='.repeat(33);
    logUtils.log(divider);
    logUtils.logStatus(`source file: ${sourceStats.fileName.toUpperCase()}`);
    logUtils.logStatus(`size: ${sourceStats.size} | days: ${this.formatNumber(sourceStats.days)}`);
    logUtils.logStatus(`lines: ${this.formatNumber(sourceStats.lines)} | events: ${this.formatNumber(sourceStats.events)}`);
    logUtils.logStatus(`events matched: ${this.formatNumber(stats.eventsMatched)}`);
    logUtils.log(divider);
    logUtils.logStatus(`dist file: ${distStats.fileName.toUpperCase()}`);
    logUtils.logStatus(`size: ${distStats.size} | days: ${this.formatNumber(distStats.days)}`);
    logUtils.logStatus(`lines: ${this.formatNumber(distStats.lines)} | events: ${this.formatNumber(distStats.events)}`);
    logUtils.logStatus(`events removed: ${this.formatNumber(stats.eventsRemoved)}`);
    logUtils.log(divider);
  }

  /**
   * Gets file statistics including size, line count, day count, and event count.
   *
   * @param filePath - Path to the file to analyze
   * @returns Promise resolving to FileStats object
   */
  private async getFileStats(filePath: string): Promise<FileStats> {
    const stats: any = await fs.stat(filePath);
    const content: string = await fs.readFile(filePath, 'utf-8');
    const lines: string[] = content.split('\n');
    const fileName: string = path.basename(filePath);
    const size: string = this.formatFileSize(stats.size);
    const days: number = this.countDays(content);
    const events: number = this.countEvents(content);
    return {
      fileName,
      size,
      lines: lines.length,
      days,
      events,
    };
  }

  /**
   * Counts lines that match the day title pattern (DD/MM/YYYY).
   *
   * @param content - File content as string
   * @returns Promise resolving to number of day lines
   */
  private countDays(content: string): number {
    const lines: string[] = content.split('\n');
    const dayPattern: RegExp = /^\d{2}\/\d{2}\/\d{4}/;
    return lines.filter((line: string) => dayPattern.test(line)).length;
  }

  /**
   * Counts lines that start with a dash (event lines).
   *
   * @param content - File content as string
   * @returns Promise resolving to number of event lines
   */
  private countEvents(content: string): number {
    const lines: string[] = content.split('\n');
    return lines.filter((line: string) => line.trim().startsWith('-')).length;
  }

  /**
   * Formats byte size to kilobytes string (e.g., "42KB").
   *
   * @param bytes - Size in bytes
   * @returns Formatted size string
   */
  private formatFileSize(bytes: number): string {
    const kilobytes: number = Math.round(bytes / 1024);
    return `${kilobytes}KB`;
  }

  /**
   * Formats a number with locale-aware thousands separator (en-US).
   *
   * @param num - Number to format
   * @returns Formatted number string
   */
  private formatNumber(num: number): string {
    return num.toLocaleString('en-US');
  }
}

const statisticsService: StatisticsService = new StatisticsService();
export { statisticsService };
