import { promises as fs } from 'fs';
import { WriteEventFileParams } from '../types';
import { SETTINGS } from '../settings';
import { pathUtils } from '../utils';
import { sectionDividerSeparator } from '../separators';

const { distPath } = SETTINGS.global;
const { distFileName } = SETTINGS.create;

class FileWriterService {
  /**
   * Writes the events file with header, future events, and event sections to the dist path.
   *
   * @param params - WriteEventFileParams (eventsText, headerLines, futureEventLines)
   * @returns Promise resolving to the path of the written file
   */
  public async writeEventFile(params: WriteEventFileParams): Promise<string> {
    const { eventsText, headerLines, futureEventLines } = params;
    const lines: string[] = [];
    for (let i: number = 0; i < headerLines.length; i++) {
      const headerLine: string = headerLines[i];
      lines.push(headerLine);
      if (headerLine.includes('FUTURE-EVENTS#:')) {
        const nextIndex: number = i + 1;
        if (nextIndex < headerLines.length && headerLines[nextIndex].includes(sectionDividerSeparator)) {
          lines.push(headerLines[nextIndex]);
          i++;
          if (futureEventLines.length > 0) {
            lines.push('');
            for (const futureEventLine of futureEventLines) {
              lines.push(futureEventLine);
            }
          }
        }
      }
    }
    lines.push('');
    for (const event of eventsText) {
      lines.push(`${event.dateTitle}.`);
      for (const line of event.lines) {
        lines.push(line);
      }
      lines.push('');
      lines.push(sectionDividerSeparator);
      lines.push('');
    }
    const filePath: string = pathUtils.getJoinPath(
      distPath,
      `${distFileName}.txt`
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
   * @throws {Error} Re-throws any error other than file-not-found (ENOENT)
   */
  private async deleteFileIfExists(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // Ignore error if file doesn't exist (ENOENT).
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
      // Directory doesn't exist, create it.
      await fs.mkdir(dirPath, { recursive: true });
    }
  }
}

const fileWriterService: FileWriterService = new FileWriterService();
export { fileWriterService };
