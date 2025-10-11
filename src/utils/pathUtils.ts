import path from 'path';
import { fileURLToPath } from 'url';

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

class PathUtils {
  public getPath(relativePath: string): string {
    return path.join(__dirname, relativePath);
  }
}

const pathUtils: PathUtils = new PathUtils();
export { pathUtils };
