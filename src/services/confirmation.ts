import readline from 'readline';
import { SETTINGS } from '../settings';
import { logUtils, systemUtils } from '../utils';

class ConfirmationService {
  public async run(scriptName: string): Promise<void> {
    // Log all the settings to the console.
    this.logSettings(scriptName);
    // Wait and handle the user input.
    await this.handleUserInput();
  }

  private logSettings(scriptName: string): void {
    const message: string = `Executing ${scriptName} script
==============================
           SETTINGS
==============================
${this.logObject(SETTINGS, '', true)}
==============================
Good to go? (y = yes)`;
    logUtils.log(message);
  }

  private logObject(
    obj: Record<string, any>,
    indent: string = '',
    flattenFirst: boolean = false
  ): string {
    const lines: string[] = [];
    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if (flattenFirst) {
          lines.push(this.logObject(value, indent, false));
        } else {
          lines.push(`${indent}${key}:`);
          lines.push(this.logObject(value, indent + '  ', false));
        }
      } else {
        lines.push(`${indent}${key}: ${value}`);
      }
    }
    return lines.join('\n');
  }

  private setRawMode(value: any): void {
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(value);
    }
  }

  private async handleUserInput(): Promise<void> {
    readline.emitKeypressEvents(process.stdin);
    this.setRawMode(true);
    const isGoodToGo: unknown = await new Promise((resolve, reject) => {
      try {
        process.stdin.on('keypress', (_chunk, key) => {
          resolve((key && key.name === 'y') || key.sequence === 'ט');
          this.setRawMode(false);
        });
      } catch (error) {
        this.setRawMode(false);
        reject(false);
      }
    }).catch();
    if (!isGoodToGo) {
      systemUtils.exit('ABORT BY THE USER');
    }
  }
}

const confirmationService: ConfirmationService = new ConfirmationService();
export { confirmationService };
