import { promises as fs } from 'fs';
import path from 'path';
import { CalculatorState, DayData, SyncResult, MergeDaysParams, WriteMergedFileParams, CounterPattern } from '../types';
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
const COUNTER_PATTERN: RegExp = /^(-[^\d]*?)(\d+)(\s+.+?)(?:\s*[\.\*].*)?$/;

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
    logUtils.logStatus(`detecting counters from previous year: ${year - 1}`);
    const previousYearFilePath: string = await this.findPreviousYearFile(year);
    const previousYearLines: string[] = await fileReaderService.readFile(previousYearFilePath);
    const detectedCounters: CounterPattern[] = this.detectCounters(previousYearLines, year - 1);
    if (detectedCounters.length > 0) {
      logUtils.logStatus(`detected ${detectedCounters.length} counter(s) to apply`);
    } else {
      logUtils.logStatus('no counters detected from previous year');
    }
    logUtils.logStatus('merging days and tasks');
    const { mergedDays, syncedDays, unsyncedDays } = this.mergeDays({
      sourceDays,
      archiveDays,
      calculatorMap,
    }, detectedCounters, year);
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
      appliedCounters: detectedCounters.length > 0 ? detectedCounters : undefined,
    };
  }

  /**
   * Finds and validates source and archive files, ensuring they exist and years match.
   * When multiple years exist, uses the most recent year.
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
    const sourceFiles: Array<{ file: string; year: number }> = [];
    const archiveFiles: Array<{ file: string; year: number }> = [];
    for (const file of files) {
      const sourceMatch: RegExpMatchArray | null = file.match(
        FILENAME_YEAR_PATTERN
      );
      if (sourceMatch) {
        sourceFiles.push({ file, year: parseInt(sourceMatch[1]) });
      }
      const archiveMatch: RegExpMatchArray | null = file.match(
        ARCHIVE_FILENAME_YEAR_PATTERN
      );
      if (archiveMatch) {
        archiveFiles.push({ file, year: parseInt(archiveMatch[1]) });
      }
    }
    if (sourceFiles.length === 0) {
      throw new Error(
        `[ERROR-1000014] Source file not found in ${sourcesPath}. Expected format: event-dates-YYYY.txt`
      );
    }
    if (archiveFiles.length === 0) {
      throw new Error(
        `[ERROR-1000015] Archive file not found in ${sourcesPath}. Expected format: event-dates-archive-YYYY.txt`
      );
    }
    sourceFiles.sort((a, b) => b.year - a.year);
    archiveFiles.sort((a, b) => b.year - a.year);
    const latestSourceFile = sourceFiles[0];
    const matchingArchive = archiveFiles.find((a) => a.year === latestSourceFile.year);
    if (!matchingArchive) {
      const availableArchiveYears: string = archiveFiles.map((a) => a.year).join(', ');
      throw new Error(
        `[ERROR-1000016] No matching archive file found for source year ${latestSourceFile.year}.\nAvailable archive years: ${availableArchiveYears}\nExpected: event-dates-archive-${latestSourceFile.year}.txt`
      );
    }
    const sourceFilePath: string = path.join(sourcesPath, latestSourceFile.file);
    const archiveFilePath: string = path.join(sourcesPath, matchingArchive.file);
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
      year: latestSourceFile.year,
    };
  }

  private async findPreviousYearFile(currentYear: number): Promise<string> {
    const previousYear: number = currentYear - 1;
    const previousYearFileName: string = `event-dates-${previousYear}.txt`;
    const previousYearFilePath: string = path.join(sourcesPath, previousYearFileName);
    try {
      await fs.access(previousYearFilePath);
      logUtils.logStatus(`found previous year file: ${previousYearFileName}`);
      return previousYearFilePath;
    } catch {
      throw new Error(`[ERROR-1000019] Previous year file not found: ${previousYearFilePath}. Cannot detect counters for year ${currentYear}.`);
    }
  }

  private detectCounters(previousYearLines: string[], previousYear: number): CounterPattern[] {
    const previousYearDays: DayData[] = this.parseDays(previousYearLines, false);
    if (previousYearDays.length < 10) {
      return [];
    }
    const daysFromPreviousYear: DayData[] = previousYearDays.filter((day: DayData) => day.year === previousYear);
    daysFromPreviousYear.sort((a: DayData, b: DayData) => {
      const dateA: Date = new Date(a.year, a.month - 1, a.day);
      const dateB: Date = new Date(b.year, b.month - 1, b.day);
      return dateA.getTime() - dateB.getTime();
    });
    const dec31: DayData | undefined = daysFromPreviousYear.find((day: DayData) => day.day === 31 && day.month === 12);
    if (!dec31) {
      return [];
    }
    const dec31Index: number = daysFromPreviousYear.findIndex((day: DayData) => day.day === 31 && day.month === 12);
    if (dec31Index < 9) {
      return [];
    }
    const last10Days: DayData[] = daysFromPreviousYear.slice(dec31Index - 9, dec31Index + 1);
    const countersFromLastDay: Map<string, { value: number; taskLine: string; position: number }> = new Map();
    dec31.tasks.forEach((task: string, index: number) => {
      const match: RegExpMatchArray | null = task.match(COUNTER_PATTERN);
      if (match) {
        const pattern: string = `${match[1]}NUM${match[3]}`;
        const value: number = parseInt(match[2]);
        countersFromLastDay.set(pattern, { value, taskLine: task, position: index });
      }
    });
    const validCounters: CounterPattern[] = [];
    for (const [pattern, lastDayData] of countersFromLastDay.entries()) {
      let isValidCounter: boolean = true;
      let expectedValue: number = lastDayData.value - (last10Days.length - 1);
      for (const day of last10Days) {
        const hasCounter: boolean = day.tasks.some((task: string) => {
          const match: RegExpMatchArray | null = task.match(COUNTER_PATTERN);
          if (!match) {
            return false;
          }
          const taskPattern: string = `${match[1]}NUM${match[3]}`;
          const taskValue: number = parseInt(match[2]);
          return taskPattern === pattern && taskValue === expectedValue;
        });
        if (!hasCounter) {
          isValidCounter = false;
          break;
        }
        expectedValue++;
      }
      if (isValidCounter) {
        validCounters.push({
          pattern,
          baselineValue: lastDayData.value,
          taskTemplate: lastDayData.taskLine,
          position: lastDayData.position,
        });
      }
    }
    return validCounters;
  }

  private applyCountersToDay(day: DayData, counters: CounterPattern[], daysElapsed: number): DayData {
    if (counters.length === 0) {
      return day;
    }
    let newTasks: string[] = [...day.tasks];
    for (const counter of counters) {
      const newValue: number = counter.baselineValue + daysElapsed;
      const newTask: string = counter.taskTemplate.replace(/\d+/, newValue.toString());
      const counterAlreadyExists: boolean = newTasks.some((task: string) => {
        const match: RegExpMatchArray | null = task.match(COUNTER_PATTERN);
        if (!match) {
          return false;
        }
        const taskPattern: string = `${match[1]}NUM${match[3]}`;
        return taskPattern === counter.pattern;
      });
      if (!counterAlreadyExists) {
        const insertPosition: number = Math.min(counter.position, newTasks.length);
        newTasks.splice(insertPosition, 0, newTask);
      }
    }
    const placeholderPattern: RegExp = /יום\s+###\s+/;
    newTasks = newTasks.filter((task: string) => {
      if (!placeholderPattern.test(task)) {
        return true;
      }
      for (const counter of counters) {
        const counterMatch: RegExpMatchArray | null = counter.taskTemplate.match(COUNTER_PATTERN);
        if (counterMatch) {
          const counterTextWithoutNumber: string = `${counterMatch[1]}${counterMatch[3]}`;
          const taskTextWithoutHashAndNumber: string = task.replace(/###/, '').replace(/\*$/, '').trim();
          const counterTextWithoutAsterisk: string = counterTextWithoutNumber.replace(/\*$/, '').trim();
          if (taskTextWithoutHashAndNumber.includes(counterTextWithoutAsterisk) || counterTextWithoutAsterisk.includes(taskTextWithoutHashAndNumber.replace(/-/g, ''))) {
            return false;
          }
        }
      }
      return true;
    });
    return {
      ...day,
      tasks: newTasks,
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
  private mergeDays(params: MergeDaysParams, counters: CounterPattern[], currentYear: number): { mergedDays: DayData[]; syncedDays: string[]; unsyncedDays: string[] } {
    const { sourceDays, archiveDays, calculatorMap } = params;
    const syncedDays: string[] = [];
    const unsyncedDays: string[] = [];
    const archiveDayMap: Map<string, DayData> = new Map();
    const today: Date = new Date();
    today.setHours(0, 0, 0, 0);
    for (const archiveDay of archiveDays) {
      archiveDayMap.set(
        this.normalizeDateString(archiveDay.dateString),
        archiveDay
      );
    }
    const daysForProcessing: Array<{
      sourceDay: DayData;
      mergedTasks: string[];
      hadArchiveTasks: boolean;
      isFutureDate: boolean;
    }> = [];
    for (let i: number = 0; i < sourceDays.length; i++) {
      const sourceDay: DayData = sourceDays[i];
      const dayDate: Date = new Date(sourceDay.year, sourceDay.month - 1, sourceDay.day);
      const isFutureDate: boolean = dayDate > today;
      const normalizedDate: string = this.normalizeDateString(
        sourceDay.dateString
      );
      const archiveDay: DayData | undefined = archiveDayMap.get(normalizedDate);
      const mergedTasks: string[] = [...sourceDay.tasks];
      let hadArchiveTasks: boolean = false;
      if (archiveDay) {
        mergedTasks.push(...archiveDay.tasks);
        hadArchiveTasks = true;
        if (!isFutureDate) {
          syncedDays.push(sourceDay.dateString);
        }
      }
      daysForProcessing.push({
        sourceDay,
        mergedTasks,
        hadArchiveTasks,
        isFutureDate,
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
    const mergedDays: DayData[] = [];
    const dec31PreviousYear: Date = new Date(currentYear - 1, 11, 31);
    for (const {
      sourceDay,
      mergedTasks,
      hadArchiveTasks,
      isFutureDate,
    } of daysForProcessing) {
      let finalTasks: string[];
      if (hadArchiveTasks && !isFutureDate) {
        finalTasks = calculatorService.addAsteriskToTasks(mergedTasks);
        syncedDays.push(sourceDay.dateString);
      } else if (hadArchiveTasks && isFutureDate) {
        finalTasks = mergedTasks;
      } else {
        finalTasks = sourceDay.tasks;
        unsyncedDays.push(sourceDay.dateString);
      }
      let dayToAdd: DayData = {
        ...sourceDay,
        tasks: finalTasks,
      };
      if (!isFutureDate && hadArchiveTasks && counters.length > 0) {
        const currentDayDate: Date = new Date(sourceDay.year, sourceDay.month - 1, sourceDay.day);
        const daysElapsed: number = Math.floor((currentDayDate.getTime() - dec31PreviousYear.getTime()) / (1000 * 60 * 60 * 24));
        dayToAdd = this.applyCountersToDay(dayToAdd, counters, daysElapsed);
      }
      mergedDays.push(dayToAdd);
    }
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
