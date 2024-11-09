import TextUtils from './text.utils';

class LogUtils {
  public log(message: string): void {
    console.log(message);
  }

  public logMessage(message: string): void {
    if (!message) {
      throw new Error(`Missing message (1000002)`);
    }
    this.log(TextUtils.setMessage(message));
  }
}

export default new LogUtils();
