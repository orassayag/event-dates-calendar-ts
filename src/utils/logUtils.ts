class LogUtils {
  /**
   * Outputs a message to the console.
   *
   * @param message - The message to log
   * @returns void
   */
  public log(message: string): void {
    console.log(message);
  }

  /**
   * Logs a status message in uppercase with delimiters.
   *
   * @param message - The status message to log
   * @returns void
   */
  public logStatus(message: string): void {
    this.log(`===${message.toUpperCase()}===`);
  }

  /**
   * Logs an error message with delimiters.
   *
   * @param message - The error message to log
   * @returns void
   */
  public logError(message: string): void {
    this.log(`===${message}===`);
  }
}

const logUtils: LogUtils = new LogUtils();
export { logUtils };
