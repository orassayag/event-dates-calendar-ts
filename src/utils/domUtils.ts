import jsdom from 'jsdom';

const { JSDOM } = jsdom;

class DomUtils {
  /**
   * Fetches a URL and parses it into a JSDOM document for DOM manipulation.
   *
   * @param url - The URL to fetch and parse
   * @returns Promise resolving to the JSDOM instance
   *
   * @example
   * const dom = await domUtils.getDomFromUrl('https://example.com');
   * const elements = dom.window.document.querySelectorAll('div');
   */
  public async getDomFromUrl(url: string): Promise<any> {
    const dom: any = await JSDOM.fromURL(url);
    dom.serialize();
    return dom;
  }
}

const domUtils: DomUtils = new DomUtils();
export { domUtils };
