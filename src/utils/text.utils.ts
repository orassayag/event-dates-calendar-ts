class TextUtils {
  private separator: string = '===';

  public setMessage(message: string): string {
    if (!message) {
      throw new Error(`Missing message (1000003)`);
    }
    return `${this.separator}${message}${this.separator}`;
  }
}

export default new TextUtils();
