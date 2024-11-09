import readline from 'readline';
import { LogUtils } from '../utils';

class ConfirmationService {
  public setRawMode(value: boolean): void {
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(value);
    }
  }

  public async confirm(): Promise<unknown> {
    LogUtils.log(logService.createConfirmSettingsTemplate());
    readline.emitKeypressEvents(process.stdin);
    this.setRawMode(true);
    return await new Promise((resolve, reject) => {
      try {
        process.stdin.on('keypress', (_chunk, key) => {
          const { name, sequence } = key || {};
          resolve(name === 'y' || sequence === 'ט');
          this.setRawMode(false);
        });
      } catch (error) {
        this.setRawMode(false);
        reject(false);
      }
    }).catch();
  }
}

export default new ConfirmationService();
