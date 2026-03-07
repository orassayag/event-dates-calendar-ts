class TextUtils {
  /**
   * Cleans a line by trimming whitespace and removing carriage returns and BOM.
   *
   * @param line - The raw line string to clean
   * @returns The cleaned line string
   */
  public cleanLine(line: string): string {
    return line
      .trim()
      .replace(/\r/g, '')
      .replace(/\uFEFF/g, '');
  }

  /**
   * Checks whether the text contains any Hebrew characters.
   *
   * @param text - The text to check
   * @returns True if Hebrew characters are present
   */
  public containsHebrew(text: string): boolean {
    const hebrewRegex: RegExp = /[\u0590-\u05FF]/;
    return hebrewRegex.test(text);
  }

  /**
   * Reverses a string for right-to-left display (e.g., Hebrew text in console).
   *
   * @param text - The text to reverse
   * @returns The reversed string
   */
  public reverseForRTL(text: string): string {
    return text.split('').reverse().join('');
  }
}

const textUtils: TextUtils = new TextUtils();
export { textUtils };
