import { searchService, validationService } from '../services';
import { SearchResult } from '../types';
import { logUtils, systemUtils, textUtils } from '../utils';

class SearchScript {
  /**
   * Runs the search script: validates configuration, then executes the search.
   *
   * @returns Promise that resolves when the search completes
   */
  public async run(): Promise<void> {
    logUtils.logStatus('running: search script');
    await validationService.run('search');
    await this.search();
  }

  /**
   * Executes the search and displays the results.
   *
   * @returns Promise that resolves when the search and display are complete
   */
  private async search(): Promise<void> {
    const result: SearchResult = await searchService.search();
    logUtils.logStatus('search completed successfully');
    this.displayResults(result);
    systemUtils.exit('SCRIPT COMPLETE');
  }

  /**
   * Displays the search results to the console with file names, line numbers, and content.
   *
   * @param result - The search result containing matches and metadata
   * @returns void
   */
  private displayResults(result: SearchResult): void {
    const { searchKey, totalMatches, fileMatches } = result;
    const divider: string = '='.repeat(33);
    logUtils.log(divider);
    logUtils.log(`===SEARCH: "${searchKey}"===`);
    logUtils.log(`===RESULTS COUNT: ${totalMatches}===`);
    logUtils.log('===RESULTS===');
    if (totalMatches === 0) {
      logUtils.log('No matches found.');
    } else {
      for (const match of fileMatches) {
        const displayContent: string = textUtils.containsHebrew(match.lineContent)
          ? textUtils.reverseForRTL(match.lineContent)
          : match.lineContent;
        logUtils.log(`${match.fileName} | Line ${match.lineNumber} | ${displayContent}.`);
      }
    }
    logUtils.log(divider);
  }
}

export default new SearchScript();
