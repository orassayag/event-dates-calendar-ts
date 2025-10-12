import * as fs from 'fs';
import * as readline from 'readline';

class FileReaderService {
  async readFile(filePath: string): Promise<string[]> {
    const fileStream: fs.ReadStream = fs.createReadStream(filePath, {
      encoding: 'utf8',
    });
    const rl: readline.Interface = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity, // Treats \r\n as a single line break.
    });
    const lines: string[] = [];
    for await (const line of rl) {
      lines.push(line);
    }
    return lines;
  }
}

const fileReaderService: FileReaderService = new FileReaderService();
export { fileReaderService };
