import { promises as fs } from 'fs';
import path from 'path';
import { SETTINGS } from '../settings';
import { logUtils, fileUtils } from '../utils';

type ScriptType = 'create' | 'validate' | 'search' | 'stop-counter' | 'sync';

class ValidationService {
  /**
   * Runs validation for the project. Optionally validates script-specific prerequisites.
   *
   * @param scriptType - Optional script type to validate prerequisites for (create, validate, search, stop-counter, sync)
   * @throws {Error} When script prerequisites fail (e.g., missing files, invalid config)
   */
  async run(scriptType?: ScriptType): Promise<void> {
    logUtils.logStatus('validating settings');
    if (scriptType) {
      await this.validateScriptPrerequisites(scriptType);
    }
  }

  /**
   * Validates prerequisites for the specified script type.
   *
   * @param scriptType - Script type to validate (create, validate, search, stop-counter, sync)
   * @throws {Error} When validation fails for the script
   */
  private async validateScriptPrerequisites(scriptType: ScriptType): Promise<void> {
    switch (scriptType) {
      case 'create':
        await this.validateCreateScript();
        break;
      case 'validate':
        await this.validateValidateScript();
        break;
      case 'search':
        await this.validateSearchScript();
        break;
      case 'stop-counter':
        await this.validateStopCounterScript();
        break;
      case 'sync':
        await this.validateSyncScript();
        break;
    }
  }

  /**
   * Validates create script: ensures previous year source file exists.
   *
   * @throws {Error} When previous year file is not found
   */
  private async validateCreateScript(): Promise<void> {
    const { targetYear } = SETTINGS.create;
    const { sourcePath } = SETTINGS.global;
    const previousYear: number = targetYear - 1;
    const expectedPreviousFile: string = sourcePath.replace(/\d{4}/, previousYear.toString());
    const fileExists: boolean = await fileUtils.fileExists(expectedPreviousFile);
    if (!fileExists) {
      throw new Error(
        `[ERROR-1000002] Previous year source file not found: ${expectedPreviousFile}\nPlease ensure the ${previousYear} events file exists before creating ${targetYear} calendar.`
      );
    }
    logUtils.logStatus(`validated: previous year file exists (${previousYear})`);
  }

  /**
   * Validates validate script: ensures source file exists in sourcesPath.
   *
   * @throws {Error} When no event-dates-YYYY.txt file is found
   */
  private async validateValidateScript(): Promise<void> {
    const { sourcesPath } = SETTINGS.sync;
    const files: string[] = await fs.readdir(sourcesPath);
    const sourceFile: string | undefined = files.find((file: string) =>
      /^event-dates-\d{4}\.txt$/.test(file)
    );
    if (!sourceFile) {
      throw new Error(
        `[ERROR-1000003] No source file found in ${sourcesPath}.\nExpected format: event-dates-YYYY.txt`
      );
    }
    logUtils.logStatus(`validated: source file exists (${sourceFile})`);
  }

  /**
   * Validates search script: ensures search key is configured and sources directory exists.
   *
   * @throws {Error} When search key is empty or sources directory not found
   */
  private async validateSearchScript(): Promise<void> {
    const { searchKey, sourcesPath } = SETTINGS.search;
    if (!searchKey || searchKey.trim().length === 0) {
      throw new Error('[ERROR-1000004] Search key is empty. Please configure a valid search key in settings.');
    }
    const dirExists: boolean = await fileUtils.fileExists(sourcesPath);
    if (!dirExists) {
      throw new Error(`[ERROR-1000005] Sources directory not found: ${sourcesPath}`);
    }
    logUtils.logStatus('validated: search key configured and sources directory exists');
  }

  /**
   * Validates stop-counter script: ensures counter config and source file exist.
   *
   * @throws {Error} When counter pattern or stop date is empty or source file not found
   */
  private async validateStopCounterScript(): Promise<void> {
    const { counterPatternText, stopDate } = SETTINGS.stopCounter;
    const { sourcesPath } = SETTINGS.sync;
    if (!counterPatternText || counterPatternText.trim().length === 0) {
      throw new Error('[ERROR-1000006] Counter pattern text is empty. Please configure it in settings.');
    }
    if (!stopDate || stopDate.trim().length === 0) {
      throw new Error('[ERROR-1000007] Stop date is empty. Please configure it in settings.');
    }
    const files: string[] = await fs.readdir(sourcesPath);
    const sourceFile: string | undefined = files.find((file: string) =>
      /^event-dates-\d{4}\.txt$/.test(file)
    );
    if (!sourceFile) {
      throw new Error(
        `[ERROR-1000008] No source file found in ${sourcesPath}.\nExpected format: event-dates-YYYY.txt`
      );
    }
    logUtils.logStatus('validated: counter configuration and source file exist');
  }

  /**
   * Validates sync script: ensures source and archive files exist with matching years.
   * When multiple years exist, uses the most recent year.
   *
   * @throws {Error} When source or archive file not found or years mismatch
   */
  private async validateSyncScript(): Promise<void> {
    const { sourcesPath } = SETTINGS.sync;
    const files: string[] = await fs.readdir(sourcesPath);
    const sourceFiles: Array<{ file: string; year: number }> = [];
    const archiveFiles: Array<{ file: string; year: number }> = [];
    for (const file of files) {
      const sourceMatch: RegExpMatchArray | null = file.match(/^event-dates-(\d{4})\.txt$/);
      if (sourceMatch) {
        sourceFiles.push({ file, year: parseInt(sourceMatch[1]) });
      }
      const archiveMatch: RegExpMatchArray | null = file.match(/^event-dates-archive-(\d{4})\.txt$/);
      if (archiveMatch) {
        archiveFiles.push({ file, year: parseInt(archiveMatch[1]) });
      }
    }
    if (sourceFiles.length === 0) {
      throw new Error(
        `[ERROR-1000009] Source file not found in ${sourcesPath}.\nExpected format: event-dates-YYYY.txt`
      );
    }
    if (archiveFiles.length === 0) {
      throw new Error(
        `[ERROR-1000010] Archive file not found in ${sourcesPath}.\nExpected format: event-dates-archive-YYYY.txt`
      );
    }
    sourceFiles.sort((a, b) => b.year - a.year);
    archiveFiles.sort((a, b) => b.year - a.year);
    const latestSourceYear: number = sourceFiles[0].year;
    const matchingArchive = archiveFiles.find((a) => a.year === latestSourceYear);
    if (!matchingArchive) {
      const availableArchiveYears: string = archiveFiles.map((a) => a.year).join(', ');
      throw new Error(
        `[ERROR-1000011] No matching archive file found for source year ${latestSourceYear}.\nAvailable archive years: ${availableArchiveYears}\nExpected: event-dates-archive-${latestSourceYear}.txt`
      );
    }
    logUtils.logStatus(`validated: source and archive files exist with matching years (${latestSourceYear})`);
  }
}

const validationService: ValidationService = new ValidationService();
export { validationService };
