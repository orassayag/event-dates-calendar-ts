import jsdom from 'jsdom';

const { JSDOM } = jsdom;

class DomUtils {
  public async getDomFromUrl(url: string): Promise<any> {
    const dom: any = await JSDOM.fromURL(url);
    dom.serialize();
    return dom;
  }
}

const domUtils: DomUtils = new DomUtils();
export { domUtils };
