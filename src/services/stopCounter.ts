import { promises as fs } from 'fs';
import path from 'path';
import { StopCounterResult, StopCounterStats, CounterPattern, CounterOccurrence, ProcessLinesParams } from '../types';
import { SETTINGS } from '../settings';
import { fileReaderService } from './fileReader';
import { pathUtils, logUtils } from '../utils';
import { eventsSectionSeparator } from '../separators';

const { distPath } = SETTINGS.global;
const { sourcesPath } = SETTINGS.sync;
const { counterPatternText, stopDate } = SETTINGS.stopCounter;
const DAY_TITLE_PATTERN: RegExp = /^(\d{2})[\/\.\-](\d{2})[\/\.\-](\d{4})/;
const COUNTER_PATTERN: RegExp = /^-(.+?)(\d+|###)(.+?)\. \*$/;
const COUNTER_PATTERN_NO_ASTERISK: RegExp = /^-(.+?)(\d+|###)(.+?)\.$/;
const EVENT_LINE_PATTERN: RegExp = /^[-\*].+/;
const FILENAME_PATTERN: RegExp = /^event-dates-(\d{4})\.txt$/;

class StopCounterService {
  private year: number = 0;
  private stopDateValue: Date | 'all' = 'all';

  /**
   * Runs the stop-counter workflow: finds source file, detects counters, removes matching events on/after stop date, writes output.
   *
   * @returns Promise resolving to StopCounterResult with file paths and stats
   * @throws {Error} When source file not found or stop date is invalid
   * @example
   * const result = await stopCounterService.stopCounter();
   */
  public async stopCounter(): Promise<StopCounterResult> {
    const sourceFilePath: string = await this.findAndValidateSourceFile();
    logUtils.logStatus(`processing file: ${path.basename(sourceFilePath)}`);
    this.parseStopDate();
    const sourceLines: string[] = await fileReaderService.readFile(sourceFilePath);
    const stats: StopCounterStats = {
      totalLines: sourceLines.length,
      totalEvents: 0,
      totalDays: 0,
      eventsMatched: 0,
      eventsRemoved: 0,
    };
    logUtils.logStatus('detecting counters');
    const counterPatterns: Map<string, CounterPattern> = this.detectCounters(sourceLines);
    logUtils.logStatus(`found ${counterPatterns.size} counter patterns`);
    const targetPattern: CounterPattern | undefined = this.findTargetPattern(counterPatterns);
    if (!targetPattern) {
      logUtils.logStatus(`warning: counter pattern "${counterPatternText}" not found in file`);
    }
    logUtils.logStatus('processing and removing counter events');
    const processedLines: string[] = this.processLines({
      lines: sourceLines,
      stats,
      targetPattern,
    });
    logUtils.logStatus('writing output file');
    const distFilePath: string = await this.writeOutputFile(processedLines);
    return {
      sourceFilePath,
      distFilePath,
      stats,
    };
  }

  /**
   * Finds and validates the event-dates-YYYY.txt source file in sourcesPath.
   *
   * @returns Promise resolving to full path of the source file
   * @throws {Error} When source file not found or inaccessible
   */
  private async findAndValidateSourceFile(): Promise<string> {
    const files: string[] = await fs.readdir(sourcesPath);
    let sourceFile: string | undefined;
    let sourceYear: number | undefined;
    for (const file of files) {
      const match: RegExpMatchArray | null = file.match(FILENAME_PATTERN);
      if (match) {
        sourceFile = file;
        sourceYear = parseInt(match[1]);
        break;
      }
    }
    if (!sourceFile || !sourceYear) {
      throw new Error(
        `[ERROR-1000019] Source file not found in ${sourcesPath}. Expected format: event-dates-YYYY.txt`
      );
    }
    const filePath: string = path.join(sourcesPath, sourceFile);
    try {
      await fs.access(filePath);
    } catch {
      throw new Error(`[ERROR-1000020] Source file not accessible: ${filePath}`);
    }
    this.year = sourceYear;
    return filePath;
  }

  /**
   * Parses the stopDate setting into a Date or 'all' and sets stopDateValue.
   *
   * @throws {Error} When stopDate format is invalid (expected DD/MM/YYYY or "all")
   */
  private parseStopDate(): void {
    if (stopDate === 'all') {
      this.stopDateValue = 'all';
      return;
    }
    const dateMatch: RegExpMatchArray | null = stopDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!dateMatch) {
      throw new Error(
        `[ERROR-1000021] Invalid stopDate format: "${stopDate}". Expected DD/MM/YYYY or "all"`
      );
    }
    const day: number = parseInt(dateMatch[1]);
    const month: number = parseInt(dateMatch[2]);
    const year: number = parseInt(dateMatch[3]);
    this.stopDateValue = new Date(year, month - 1, day);
  }

  /**
   * Detects counter patterns in lines (sequential numeric patterns with 10+ occurrences).
   *
   * @param lines - Raw source file lines
   * @returns Map of event text to CounterPattern for detected counters
   */
  private detectCounters(lines: string[]): Map<string, CounterPattern> {
    const counterCandidates: Map<string, CounterOccurrence[]> = new Map();
    let inEventsSection: boolean = false;
    let currentDate: string = '';
    for (let i: number = 0; i < lines.length; i++) {
      const line: string = lines[i];
      const trimmedLine: string = line.trim();
      if (trimmedLine.includes(eventsSectionSeparator)) {
        inEventsSection = true;
        continue;
      }
      if (!inEventsSection) {
        continue;
      }
      const dateMatch: RegExpMatchArray | null = trimmedLine.match(DAY_TITLE_PATTERN);
      if (dateMatch) {
        currentDate = `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}`;
        continue;
      }
      const counterMatch: RegExpMatchArray | null = trimmedLine.match(COUNTER_PATTERN);
      if (counterMatch) {
        const prefix: string = counterMatch[1];
        const valueStr: string = counterMatch[2];
        const suffix: string = counterMatch[3];
        const eventText: string = prefix + suffix;
        const value: number | '###' = valueStr === '###' ? '###' : parseInt(valueStr);
        if (!counterCandidates.has(eventText)) {
          counterCandidates.set(eventText, []);
        }
        counterCandidates.get(eventText)!.push({
          lineNumber: i + 1,
          lineIndex: i,
          value,
          dateString: currentDate,
          fullText: trimmedLine,
        });
      }
    }
    const counterPatterns: Map<string, CounterPattern> = new Map();
    for (const [eventText, occurrences] of counterCandidates.entries()) {
      const numericOccurrences: number[] = occurrences
        .filter((occ: CounterOccurrence) => typeof occ.value === 'number')
        .map((occ: CounterOccurrence) => occ.value as number);
      if (numericOccurrences.length >= 10) {
        const uniqueValues: Set<number> = new Set(numericOccurrences);
        const sortedUniqueValues: number[] = Array.from(uniqueValues).sort((a: number, b: number) => a - b);
        if (sortedUniqueValues.length >= 10) {
          let isSequential: boolean = true;
          for (let i: number = 1; i < sortedUniqueValues.length; i++) {
            const diff: number = sortedUniqueValues[i] - sortedUniqueValues[i - 1];
            if (diff > 2) {
              isSequential = false;
              break;
            }
          }
          if (isSequential) {
            const firstOccurrence: CounterOccurrence = occurrences[0];
            const match: RegExpMatchArray | null = firstOccurrence.fullText.match(COUNTER_PATTERN);
            if (match) {
              const prefix: string = match[1];
              const suffix: string = match[3];
              counterPatterns.set(eventText, {
                eventText,
                prefix,
                suffix,
                occurrences: occurrences.length,
                lastValue: Math.max(...numericOccurrences),
                isCounter: true,
              });
            }
          }
        }
      }
    }
    return counterPatterns;
  }

  /**
   * Finds the target counter pattern matching counterPatternText from settings.
   *
   * @param counterPatterns - Map of detected counter patterns
   * @returns Matching CounterPattern or undefined if not found
   */
  private findTargetPattern(counterPatterns: Map<string, CounterPattern>): CounterPattern | undefined {
    const normalizedTarget: string = this.normalizeText(counterPatternText);
    for (const pattern of counterPatterns.values()) {
      const normalizedPattern: string = this.normalizeText(pattern.eventText);
      if (normalizedPattern.includes(normalizedTarget) || normalizedTarget.includes(normalizedPattern)) {
        return pattern;
      }
    }
    return undefined;
  }

  /**
   * Normalizes text by trimming and collapsing multiple spaces to single space.
   *
   * @param text - Text to normalize
   * @returns Normalized string
   */
  private normalizeText(text: string): string {
    return text.trim().replace(/\s+/g, ' ');
  }

  /**
   * Processes lines, removing counter events on/after stop date when they match the target pattern.
   *
   * @param params - ProcessLinesParams (lines, stats, targetPattern)
   * @returns Processed lines array with matching counter events removed per stopDate
   */
  private processLines(params: ProcessLinesParams): string[] {
    const { lines, stats, targetPattern } = params;
    const processedLines: string[] = [];
    let inEventsSection: boolean = false;
    let currentDate: Date | undefined;
    for (let i: number = 0; i < lines.length; i++) {
      const line: string = lines[i];
      const trimmedLine: string = line.trim();
      if (trimmedLine.includes(eventsSectionSeparator)) {
        inEventsSection = true;
        processedLines.push(line);
        continue;
      }
      if (!inEventsSection) {
        processedLines.push(line);
        continue;
      }
      const dateMatch: RegExpMatchArray | null = trimmedLine.match(DAY_TITLE_PATTERN);
      if (dateMatch) {
        stats.totalDays++;
        const day: number = parseInt(dateMatch[1]);
        const month: number = parseInt(dateMatch[2]);
        const year: number = parseInt(dateMatch[3]);
        currentDate = new Date(year, month - 1, day);
        processedLines.push(line);
        continue;
      }
      if (EVENT_LINE_PATTERN.test(trimmedLine)) {
        stats.totalEvents++;
        if (targetPattern) {
          let counterMatch: RegExpMatchArray | null = trimmedLine.match(COUNTER_PATTERN);
          if (!counterMatch) {
            counterMatch = trimmedLine.match(COUNTER_PATTERN_NO_ASTERISK);
          }
          if (counterMatch) {
            const prefix: string = counterMatch[1];
            const suffix: string = counterMatch[3];
            const eventText: string = prefix + suffix;
            if (eventText === targetPattern.eventText) {
              stats.eventsMatched++;
              if (this.shouldRemoveEvent(currentDate)) {
                stats.eventsRemoved++;
                continue;
              }
            }
          }
        }
        processedLines.push(line);
      } else {
        processedLines.push(line);
      }
    }
    return processedLines;
  }

  /**
   * Determines if an event should be removed based on stop date and current date.
   *
   * @param currentDate - Date of the current event line
   * @returns True if event should be removed (stopDate is 'all' or currentDate >= stopDate)
   */
  private shouldRemoveEvent(currentDate: Date | undefined): boolean {
    if (this.stopDateValue === 'all') {
      return true;
    }
    if (!currentDate) {
      return false;
    }
    return currentDate >= this.stopDateValue;
  }

  /**
   * Writes the processed lines to the dist file for the source year.
   *
   * @param lines - Processed lines to write
   * @returns Promise resolving to the output file path
   */
  private async writeOutputFile(lines: string[]): Promise<string> {
    const filePath: string = pathUtils.getJoinPath(distPath, `event-dates-${this.year}.txt`);
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
    } catch (error: any) {
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

const stopCounterService: StopCounterService = new StopCounterService();
export { stopCounterService };
