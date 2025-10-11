class LogUtils {
  public log(message: string): void {
    console.log(message);
  }

  public logStatus(message: string): void {
    this.log(`===${message}===`);
  }
}

const logUtils: LogUtils = new LogUtils();
export { logUtils };
