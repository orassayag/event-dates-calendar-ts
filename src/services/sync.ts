import { promises as fs } from 'fs';
import path from 'path';
import { CalculatorState, DayData, SyncResult, MergeDaysParams, WriteMergedFileParams } from '../types';
import { SETTINGS } from '../settings';
import { fileReaderService } from './fileReader';
import { calculatorService } from './calculator';
import { pathUtils, logUtils } from '../utils';
import { sectionDividerSeparator } from '../separators';

const { distPath } = SETTINGS.global;
const { sourcesPath } = SETTINGS.sync;
const DAY_TITLE_PATTERN: RegExp = /^(\d{2})[\/\.\-](\d{2})[\/\.\-](\d{4})/;
const FILENAME_YEAR_PATTERN: RegExp = /event-dates-(\d{4})\.txt$/;
const ARCHIVE_FILENAME_YEAR_PATTERN: RegExp =
  /event-dates-archive-(\d{4})\.txt$/;

class SyncService {
  /**
   * Syncs source and archive files: parses days, builds calculator state, merges tasks, writes output.
   *
   * @returns Promise resolving to SyncResult with file paths, merged days, synced and unsynced day lists
   * @throws {Error} When source/archive files not found, inaccessible, or year mismatch
   * @example
   * const result = await syncService.sync();
   */
  public async sync(): Promise<SyncResult> {
    const { sourceFilePath, archiveFilePath, year } =
      await this.findAndValidateFiles();
    logUtils.logStatus(`using year: ${year}`);
    logUtils.logStatus('reading source file');
    const sourceLines: string[] =
      await fileReaderService.readFile(sourceFilePath);
    logUtils.logStatus('reading archive file');
    const archiveLines: string[] =
      await fileReaderService.readFile(archiveFilePath);
    logUtils.logStatus('parsing days from source and archive');
    const sourceDays: DayData[] = this.parseDays(sourceLines, false);
    const archiveDays: DayData[] = this.parseDays(archiveLines, true);
    logUtils.logStatus('building calculator state from source and archive');
    const calculatorMap: Map<string, CalculatorState> =
      calculatorService.buildCalculatorState(sourceLines, archiveLines);
    logUtils.logStatus('merging days and tasks');
    const { mergedDays, syncedDays, unsyncedDays } = this.mergeDays({
      sourceDays,
      archiveDays,
      calculatorMap,
    });
    logUtils.logStatus('writing merged file');
    const distFilePath: string = await this.writeMergedFile({
      mergedDays,
      sourceLines,
      year,
    });
    return {
      sourceFilePath,
      archiveFilePath,
      distFilePath,
      mergedDays,
      syncedDays,
      unsyncedDays,
    };
  }

  /**
   * Finds and validates source and archive files, ensuring they exist and years match.
   *
   * @returns Promise resolving to object with sourceFilePath, archiveFilePath, and year
   * @throws {Error} When source or archive file not found, inaccessible, or year mismatch
   */
  private async findAndValidateFiles(): Promise<{
    sourceFilePath: string;
    archiveFilePath: string;
    year: number;
  }> {
    const files: string[] = await fs.readdir(sourcesPath);
    let sourceFile: string | undefined;
    let archiveFile: string | undefined;
    let sourceYear: number | undefined;
    let archiveYear: number | undefined;
    for (const file of files) {
      const sourceMatch: RegExpMatchArray | null = file.match(
        FILENAME_YEAR_PATTERN
      );
      if (sourceMatch) {
        sourceFile = file;
        sourceYear = parseInt(sourceMatch[1]);
      }
      const archiveMatch: RegExpMatchArray | null = file.match(
        ARCHIVE_FILENAME_YEAR_PATTERN
      );
      if (archiveMatch) {
        archiveFile = file;
        archiveYear = parseInt(archiveMatch[1]);
      }
    }
    if (!sourceFile || !sourceYear) {
      throw new Error(
        `[ERROR-1000014] Source file not found in ${sourcesPath}. Expected format: event-dates-YYYY.txt`
      );
    }
    if (!archiveFile || !archiveYear) {
      throw new Error(
        `[ERROR-1000015] Archive file not found in ${sourcesPath}. Expected format: event-dates-archive-YYYY.txt`
      );
    }
    if (sourceYear !== archiveYear) {
      throw new Error(
        `[ERROR-1000016] Year mismatch: source file has year ${sourceYear}, archive file has year ${archiveYear}`
      );
    }
    const sourceFilePath: string = path.join(sourcesPath, sourceFile);
    const archiveFilePath: string = path.join(sourcesPath, archiveFile);
    try {
      await fs.access(sourceFilePath);
    } catch {
      throw new Error(`[ERROR-1000017] Source file not accessible: ${sourceFilePath}`);
    }
    try {
      await fs.access(archiveFilePath);
    } catch {
      throw new Error(`[ERROR-1000018] Archive file not accessible: ${archiveFilePath}`);
    }
    return {
      sourceFilePath,
      archiveFilePath,
      year: sourceYear,
    };
  }

  /**
   * Parses lines into DayData array by detecting day titles and collecting tasks per day.
   *
   * @param lines - Raw file lines
   * @param isArchive - If true, treats all content as events section (no header skip)
   * @returns Array of DayData
   */
  private parseDays(lines: string[], isArchive: boolean = false): DayData[] {
    const days: DayData[] = [];
    let currentDay: DayData | null = null;
    let inEventsSection: boolean = isArchive;
    for (const line of lines) {
      const trimmedLine: string = line.trim();
      if (trimmedLine.includes('#EVENTS#:')) {
        inEventsSection = true;
        continue;
      }
      if (!inEventsSection) {
        continue;
      }
      const dateMatch: RegExpMatchArray | null =
        trimmedLine.match(DAY_TITLE_PATTERN);
      if (dateMatch) {
        if (currentDay) {
          days.push(currentDay);
        }
        const day: number = parseInt(dateMatch[1]);
        const month: number = parseInt(dateMatch[2]);
        const year: number = parseInt(dateMatch[3]);
        const dateString: string = `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}`;
        currentDay = {
          dateString,
          day,
          month,
          year,
          dayTitle: trimmedLine,
          tasks: [],
          rawLines: [],
        };
        continue;
      }
      if (currentDay) {
        if (trimmedLine.startsWith('-')) {
          currentDay.tasks.push(line);
        }
        currentDay.rawLines.push(line);
      }
    }
    if (currentDay) {
      days.push(currentDay);
    }
    return days;
  }

  /**
   * Merges source and archive days, replaces calculator placeholders, marks unsynced tasks.
   *
   * @param params - MergeDaysParams (sourceDays, archiveDays, calculatorMap)
   * @returns Object with mergedDays, syncedDays, and unsyncedDays
   */
  private mergeDays(params: MergeDaysParams): { mergedDays: DayData[]; syncedDays: string[]; unsyncedDays: string[] } {
    const { sourceDays, archiveDays, calculatorMap } = params;
    const syncedDays: string[] = [];
    const unsyncedDays: string[] = [];
    const archiveDayMap: Map<string, DayData> = new Map();
    for (const archiveDay of archiveDays) {
      archiveDayMap.set(
        this.normalizeDateString(archiveDay.dateString),
        archiveDay
      );
    }
    const daysForProcessing: Array<{
      sourceDay: DayData;
      mergedTasks: string[];
      originalIndex: number;
      hadArchiveTasks: boolean;
    }> = [];
    for (let i: number = 0; i < sourceDays.length; i++) {
      const sourceDay: DayData = sourceDays[i];
      const normalizedDate: string = this.normalizeDateString(
        sourceDay.dateString
      );
      const archiveDay: DayData | undefined = archiveDayMap.get(normalizedDate);
      const mergedTasks: string[] = [...sourceDay.tasks];
      let hadArchiveTasks: boolean = false;
      if (archiveDay) {
        mergedTasks.push(...archiveDay.tasks);
        syncedDays.push(sourceDay.dateString);
        hadArchiveTasks = true;
      }
      daysForProcessing.push({
        sourceDay,
        mergedTasks,
        originalIndex: i,
        hadArchiveTasks,
      });
    }
    daysForProcessing.sort((a, b) => {
      const dateA: Date = new Date(
        a.sourceDay.year,
        a.sourceDay.month - 1,
        a.sourceDay.day
      );
      const dateB: Date = new Date(
        b.sourceDay.year,
        b.sourceDay.month - 1,
        b.sourceDay.day
      );
      return dateA.getTime() - dateB.getTime();
    });
    const processedDays: Array<{ day: DayData; originalIndex: number }> = [];
    for (const {
      sourceDay,
      mergedTasks,
      originalIndex,
      hadArchiveTasks,
    } of daysForProcessing) {
      const hasPlaceholders: boolean = mergedTasks.some((task: string) =>
        task.includes('###')
      );
      const processedTasks: string[] =
        calculatorService.replaceCalculatorsInTasks(mergedTasks, calculatorMap);
      const markedTasks: string[] = hadArchiveTasks
        ? processedTasks
        : calculatorService.markTasksForUnsyncedDays(processedTasks);
      if (!hadArchiveTasks && hasPlaceholders) {
        unsyncedDays.push(sourceDay.dateString);
      }
      processedDays.push({
        day: {
          ...sourceDay,
          tasks: markedTasks,
        },
        originalIndex,
      });
    }
    processedDays.sort((a, b) => a.originalIndex - b.originalIndex);
    const mergedDays: DayData[] = processedDays.map((item) => item.day);
    return { mergedDays, syncedDays, unsyncedDays };
  }

  /**
   * Normalizes a date string to DD/MM/YYYY format using DAY_TITLE_PATTERN.
   *
   * @param dateString - Date string to normalize
   * @returns Normalized date string or original if no match
   */
  private normalizeDateString(dateString: string): string {
    const match: RegExpMatchArray | null = dateString.match(DAY_TITLE_PATTERN);
    if (!match) {
      return dateString;
    }
    return `${match[1]}/${match[2]}/${match[3]}`;
  }

  /**
   * Writes the merged days to the dist file, preserving header from source.
   *
   * @param params - WriteMergedFileParams (mergedDays, sourceLines, year)
   * @returns Promise resolving to the output file path
   */
  private async writeMergedFile(params: WriteMergedFileParams): Promise<string> {
    const { mergedDays, sourceLines, year } = params;
    const lines: string[] = [];
    let inEventsSection: boolean = false;
    let foundEventsSeparator: boolean = false;
    let linesAfterSeparator: number = 0;
    for (const line of sourceLines) {
      if (line.trim().includes('#EVENTS#:')) {
        inEventsSection = true;
        lines.push(line);
        continue;
      }
      if (inEventsSection && !foundEventsSeparator) {
        lines.push(line);
        if (line.trim() === sectionDividerSeparator) {
          foundEventsSeparator = true;
        }
        continue;
      }
      if (foundEventsSeparator && linesAfterSeparator < 1) {
        lines.push(line);
        linesAfterSeparator++;
        if (linesAfterSeparator === 1) {
          break;
        }
        continue;
      }
      if (!inEventsSection) {
        lines.push(line);
      }
    }
    for (const day of mergedDays) {
      lines.push(`${day.dayTitle}`);
      for (const task of day.tasks) {
        lines.push(task);
      }
      lines.push('');
      lines.push(sectionDividerSeparator);
      lines.push('');
    }
    const filePath: string = pathUtils.getJoinPath(
      distPath,
      `event-dates-${year}.txt`
    );
    await this.ensureDirectoryExists(distPath);
    await this.deleteFileIfExists(filePath);
    await fs.writeFile(filePath, lines.join('\n'), 'utf-8');
    return filePath;
  }

  /**
   * Deletes a file if it exists. Ignores ENOENT errors.
   *
   * @param filePath - Path to the file to delete
   * @throws {Error} Re-throws any error other than ENOENT
   */
  private async deleteFileIfExists(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * Ensures the directory exists, creating it recursively if it does not.
   *
   * @param dirPath - Path to the directory to ensure exists
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }
}

const syncService: SyncService = new SyncService();
export { syncService };
