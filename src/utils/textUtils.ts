class TextUtils {
  public cleanLine(line: string): string {
    return line
      .trim()
      .replace(/\r/g, '')
      .replace(/\uFEFF/g, '');
  }
}

const textUtils: TextUtils = new TextUtils();
export { textUtils };
