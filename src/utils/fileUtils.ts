import { promises as fs } from 'fs';
import { FindFileParams } from '../types';

class FileUtils {
  /**
   * Checks whether a file exists at the given path.
   *
   * @param filePath - The absolute or relative path to the file
   * @returns Promise resolving to true if the file exists, false otherwise
   */
  public async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Finds a file by checking primary path first, then fallback path.
   *
   * @param params - Object containing primaryPath, fallbackPath, and optional onFallback callback
   * @returns Promise resolving to the path of the existing file
   * @throws {Error} When neither primary nor fallback path exists
   *
   * @example
   * const path = await fileUtils.findFile({
   *   primaryPath: '/path/to/file.txt',
   *   fallbackPath: '/fallback/file.txt',
   *   onFallback: (p) => console.log('Using fallback:', p)
   * });
   */
  public async findFile(params: FindFileParams): Promise<string> {
    const { primaryPath, fallbackPath, onFallback } = params;
    const primaryExists: boolean = await this.fileExists(primaryPath);
    if (primaryExists) {
      return primaryPath;
    }
    const fallbackExists: boolean = await this.fileExists(fallbackPath);
    if (fallbackExists) {
      if (onFallback) {
        onFallback(fallbackPath);
      }
      return fallbackPath;
    }
    throw new Error(
      `[ERROR-1000001] Required file 'event-dates-index.txt' not found.\n\nChecked locations:\n  1. ${primaryPath}\n  2. ${fallbackPath}\n\nPlease ensure the file exists in one of these locations before running the script.`
    );
  }
}

const fileUtils: FileUtils = new FileUtils();
export { fileUtils };
