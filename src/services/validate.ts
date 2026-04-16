import { promises as fs } from 'fs';
import path from 'path';
import { ValidationResult, ValidationStats, FixedLine, ValidationCounterPattern, CounterOccurrence, ValidateAndFixLinesParams } from '../types';
import { SETTINGS } from '../settings';
import { fileReaderService } from './fileReader';
import { pathUtils, logUtils } from '../utils';
import { eventsSectionSeparator } from '../separators';

const { distPath } = SETTINGS.global;
const { sourcesPath } = SETTINGS.sync;
const DAY_TITLE_PATTERN: RegExp = /^(\d{2})[\/\.\-](\d{2})[\/\.\-](\d{4})/;
const COUNTER_PATTERN: RegExp = /^-(.+?)(\d+|###)(.+?)\. \*$/;
const EVENT_LINE_PATTERN: RegExp = /^[-\*].+/;
const FILENAME_PATTERN: RegExp = /^event-dates-(\d{4})\.txt$/;

class ValidateService {
  private year: number = 0;

  /**
   * Validates source file, detects counters, fixes formatting issues, and writes validated output.
   *
   * @returns Promise resolving to ValidationResult with paths, fixed lines, and stats
   * @throws {Error} When source file not found or inaccessible
   * @example
   * const result = await validateService.validate();
   */
  public async validate(): Promise<ValidationResult> {
    const sourceFilePath: string = await this.findAndValidateSourceFile();
    logUtils.logStatus(`validating file: ${path.basename(sourceFilePath)}`);
    const sourceLines: string[] = await fileReaderService.readFile(sourceFilePath);
    const stats: ValidationStats = {
      totalLines: sourceLines.length,
      totalEvents: 0,
      totalDays: 0,
      missingStart: 0,
      missingEnd: 0,
      multipleSpacesFixes: 0,
      multipleBlankLinesFixes: 0,
      fixedLinesCount: 0,
      duplicateLinesRemoved: 0,
    };
    const fixedLines: FixedLine[] = [];
    logUtils.logStatus('detecting counters');
    const counterPatterns: Map<string, ValidationCounterPattern> = this.detectCounters(sourceLines);
    logUtils.logStatus(`found ${counterPatterns.size} counter patterns`);
    logUtils.logStatus('validating and fixing formatting');
    const validatedLines: string[] = this.validateAndFixLines({
      lines: sourceLines,
      stats,
      fixedLines,
      counterPatterns,
    });
    logUtils.logStatus('writing validated file');
    const distFilePath: string = await this.writeValidatedFile(validatedLines);
    return {
      sourceFilePath,
      distFilePath,
      fixedLines,
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
        `[ERROR-1000012] Source file not found in ${sourcesPath}. Expected format: event-dates-YYYY.txt`
      );
    }
    const filePath: string = path.join(sourcesPath, sourceFile);
    try {
      await fs.access(filePath);
    } catch {
      throw new Error(`[ERROR-1000013] Source file not accessible: ${filePath}`);
    }
    this.year = sourceYear;
    return filePath;
  }

  /**
   * Detects counter patterns in lines (sequential numeric patterns with 10+ occurrences).
   *
   * @param lines - Raw source file lines
   * @returns Map of event text to ValidationCounterPattern for detected counters
   */
  private detectCounters(lines: string[]): Map<string, ValidationCounterPattern> {
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
    const counterPatterns: Map<string, ValidationCounterPattern> = new Map();
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
   * Validates and fixes event line formatting: missing dash/asterisk, multiple spaces, counter sequence.
   *
   * @param params - ValidateAndFixLinesParams (lines, stats, fixedLines, counterPatterns)
   * @returns Array of validated/fixed lines
   */
  private validateAndFixLines(params: ValidateAndFixLinesParams): string[] {
    const { lines, stats, fixedLines, counterPatterns } = params;
    const validatedLines: string[] = [];
    let inEventsSection: boolean = false;
    let previousLineWasBlank: boolean = false;
    const counterTracking: Map<string, number> = new Map();
    const seenEventsInDay: Set<string> = new Set();
    for (let i: number = 0; i < lines.length; i++) {
      let line: string = lines[i];
      const trimmedLine: string = line.trim();
      if (trimmedLine.includes(eventsSectionSeparator)) {
        inEventsSection = true;
        validatedLines.push(line);
        previousLineWasBlank = false;
        continue;
      }
      if (!inEventsSection) {
        validatedLines.push(line);
        previousLineWasBlank = false;
        continue;
      }
      const dateMatch: RegExpMatchArray | null = trimmedLine.match(DAY_TITLE_PATTERN);
      if (dateMatch) {
        stats.totalDays++;
        validatedLines.push(line);
        previousLineWasBlank = false;
        seenEventsInDay.clear();
        continue;
      }
      if (trimmedLine === '') {
        if (previousLineWasBlank) {
          stats.multipleBlankLinesFixes++;
          continue;
        }
        previousLineWasBlank = true;
        validatedLines.push(line);
        continue;
      }
      previousLineWasBlank = false;
      if (EVENT_LINE_PATTERN.test(trimmedLine)) {
        stats.totalEvents++;
        const originalLine: string = line;
        let wasFixed: boolean = false;
        const startsWithDash: boolean = trimmedLine.startsWith('-');
        const startsWithAsterisk: boolean = trimmedLine.startsWith('*');
        if (!startsWithDash && !startsWithAsterisk) {
          stats.missingStart++;
          line = '-' + line.trim();
          wasFixed = true;
        }
        const linePrefix: string = startsWithAsterisk ? '*' : '-';
        if (trimmedLine.includes(' *') || trimmedLine.includes('*,') || trimmedLine.includes('*.')) {
          const originalLineBeforeFix: string = line;
          line = line.trim();
          if (line.startsWith('-') || line.startsWith('*')) {
            line = line.slice(1).trim();
          }
          if (line.endsWith('. *')) {
            line = line.slice(0, -3);
          } else if (line.endsWith('*.')) {
            line = line.slice(0, -2);
          } else if (line.endsWith(' *')) {
            line = line.slice(0, -2);
          } else if (line.endsWith('*')) {
            line = line.slice(0, -1);
          }
          line = line.replace(/\s*\*\s*/g, ' ');
          line = line.replace(/\*,/g, ',');
          line = line.replace(/\s+/g, ' ');
          line = line.trim();
          if (!line.endsWith('.')) {
            line = line + '.';
          }
          line = linePrefix + line + ' *';
          if (originalLineBeforeFix !== line) {
            stats.missingEnd++;
            wasFixed = true;
          }
        } else if (!trimmedLine.endsWith('. *')) {
          stats.missingEnd++;
          line = line.trim();
          if (line.startsWith('-') || line.startsWith('*')) {
            const prefix: string = line[0];
            line = line.slice(1).trim();
            if (!line.endsWith('.')) {
              line = line + '.';
            }
            line = prefix + line + ' *';
          } else {
            if (!line.endsWith('.')) {
              line = line + '.';
            }
            line = linePrefix + line + ' *';
          }
          wasFixed = true;
        }
        const multipleSpacesMatch: boolean = /\s{2,}/.test(line);
        if (multipleSpacesMatch) {
          stats.multipleSpacesFixes++;
          line = line.replace(/\s{2,}/g, ' ');
          wasFixed = true;
        }
        const normalizedForDupCheck: string = line.trim();
        if (seenEventsInDay.has(normalizedForDupCheck)) {
          stats.duplicateLinesRemoved++;
          fixedLines.push({
            lineNumber: i + 1,
            originalText: originalLine.trim(),
            fixedText: '(REMOVED DUPLICATE)',
          });
          stats.fixedLinesCount++;
          continue;
        }
        seenEventsInDay.add(normalizedForDupCheck);
        const counterMatch: RegExpMatchArray | null = line.trim().match(COUNTER_PATTERN);
        if (counterMatch) {
          const prefix: string = counterMatch[1];
          const valueStr: string = counterMatch[2];
          const suffix: string = counterMatch[3];
          const eventText: string = prefix + suffix;
          if (counterPatterns.has(eventText)) {
            if (valueStr === '###') {
              validatedLines.push(line);
              continue;
            }
            const currentValue: number = parseInt(valueStr);
            const pattern: ValidationCounterPattern = counterPatterns.get(eventText)!;
            if (counterTracking.has(eventText)) {
              const previousValue: number = counterTracking.get(eventText)!;
              const expectedValue: number = previousValue + 1;
              if (currentValue === previousValue) {
                const fixedValue: number = currentValue + 1;
                const fixedLine: string = line.replace(
                  COUNTER_PATTERN,
                  `-${pattern.prefix}${fixedValue}${pattern.suffix}. *`
                );
                if (originalLine !== fixedLine) {
                  fixedLines.push({
                    lineNumber: i + 1,
                    originalText: originalLine.trim(),
                    fixedText: fixedLine.trim(),
                  });
                  stats.fixedLinesCount++;
                }
                validatedLines.push(fixedLine);
                counterTracking.set(eventText, fixedValue);
                continue;
              } else if (currentValue < expectedValue) {
                const fixedValue: number = expectedValue;
                const fixedLine: string = line.replace(
                  COUNTER_PATTERN,
                  `-${pattern.prefix}${fixedValue}${pattern.suffix}. *`
                );
                if (originalLine !== fixedLine) {
                  fixedLines.push({
                    lineNumber: i + 1,
                    originalText: originalLine.trim(),
                    fixedText: fixedLine.trim(),
                  });
                  stats.fixedLinesCount++;
                }
                validatedLines.push(fixedLine);
                counterTracking.set(eventText, fixedValue);
                continue;
              }
            }
            counterTracking.set(eventText, currentValue);
          }
        }
        if (wasFixed && originalLine !== line) {
          fixedLines.push({
            lineNumber: i + 1,
            originalText: originalLine.trim(),
            fixedText: line.trim(),
          });
          stats.fixedLinesCount++;
        }
        validatedLines.push(line);
      } else {
        validatedLines.push(line);
      }
    }
    return validatedLines;
  }

  /**
   * Writes validated lines to the dist file for the source year.
   *
   * @param lines - Validated lines to write
   * @returns Promise resolving to the output file path
   */
  private async writeValidatedFile(lines: string[]): Promise<string> {
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

const validateService: ValidateService = new ValidateService();
export { validateService };
