import path from 'path';
import { fileURLToPath } from 'url';

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

class PathUtils {
  /**
   * Resolves a relative path against the current module's directory.
   *
   * @param relativePath - The path relative to the utility module's directory
   * @returns The absolute path
   */
  public getRelativePath(relativePath: string): string {
    return path.join(__dirname, relativePath);
  }

  /**
   * Joins multiple path segments into a single path.
   *
   * @param paths - One or more path segments to join
   * @returns The joined path string
   */
  public getJoinPath(...paths: string[]): string {
    return path.join(...paths);
  }
}

const pathUtils: PathUtils = new PathUtils();
export { pathUtils };
