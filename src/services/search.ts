import { promises as fs } from 'fs';
import path from 'path';
import { SearchResult, FileMatch } from '../types';
import { SETTINGS } from '../settings';
import { fileReaderService } from './fileReader';

const { searchKey, sourcesPath } = SETTINGS.search;

class SearchService {
  /**
   * Searches for the configured search key in all .txt files in the sources directory.
   *
   * @returns Promise resolving to SearchResult with search key, total matches, and file matches sorted by filename and line number
   * @throws {Error} When no .txt files exist in sourcesPath
   */
  public async search(): Promise<SearchResult> {
    const textFiles: string[] = await this.getTextFiles(sourcesPath);
    if (textFiles.length === 0) {
      throw new Error(`[ERROR-1000022] No .txt files found in ${sourcesPath}`);
    }
    const fileMatches: FileMatch[] = [];
    for (const filePath of textFiles) {
      const matches: FileMatch[] = await this.searchInFile(filePath, searchKey);
      fileMatches.push(...matches);
    }
    fileMatches.sort((a: FileMatch, b: FileMatch) => {
      const fileComparison: number = a.fileName.localeCompare(b.fileName);
      if (fileComparison !== 0) {
        return fileComparison;
      }
      return a.lineNumber - b.lineNumber;
    });
    return {
      searchKey,
      totalMatches: fileMatches.length,
      fileMatches,
    };
  }

  /**
   * Gets all .txt file paths in the given directory.
   *
   * @param dirPath - Directory path to search
   * @returns Promise resolving to array of full paths to .txt files
   * @throws {Error} When directory does not exist or is inaccessible
   */
  private async getTextFiles(dirPath: string): Promise<string[]> {
    try {
      await fs.access(dirPath);
    } catch {
      throw new Error(`[ERROR-1000023] Sources directory not found: ${dirPath}`);
    }
    const files: string[] = await fs.readdir(dirPath);
    const textFiles: string[] = files
      .filter((file: string) => file.endsWith('.txt'))
      .map((file: string) => path.join(dirPath, file));
    return textFiles;
  }

  /**
   * Searches for searchKey (case-insensitive) in a file and returns matching lines.
   *
   * @param filePath - Path to the file to search
   * @param searchKey - String to search for (case-insensitive)
   * @returns Promise resolving to array of FileMatch with fileName, lineNumber, and lineContent
   */
  private async searchInFile(filePath: string, searchKey: string): Promise<FileMatch[]> {
    const lines: string[] = await fileReaderService.readFile(filePath);
    const fileName: string = path.basename(filePath);
    const matches: FileMatch[] = [];
    const searchKeyLower: string = searchKey.toLowerCase();
    for (let i: number = 0; i < lines.length; i++) {
      const line: string = lines[i];
      if (line.toLowerCase().includes(searchKeyLower)) {
        matches.push({
          fileName,
          lineNumber: i + 1,
          lineContent: line,
        });
      }
    }
    return matches;
  }
}

const searchService: SearchService = new SearchService();
export { searchService };
