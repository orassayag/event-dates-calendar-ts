import { YEAR } from '../place-holders';
import { Settings } from '../types';
import { pathUtils } from '../utils';

export const SETTINGS: Settings = {
  global: {
    sourcePath: pathUtils.getRelativePath('../../sources/event-dates-2025.txt'),
    distPath: pathUtils.getRelativePath('../../dist'),
  },
  create: {
    targetYear: 2026,
    israelCalendarUrl: `https://calendar.2net.co.il/annual-calendar.aspx?year=${YEAR}`,
    unitedStateCalendarUrl: `https://www.timeanddate.com/holidays/us/${YEAR}`,
    distFileName: `event-dates-${YEAR}`,
    eventsIndexPath: pathUtils.getRelativePath(
      '../../sources/event-dates-index.txt'
    ),
    eventsIndexFallbackPath:
      'C:\\Users\\Or Assayag\\Dropbox\\or-life\\documents\\daily\\event-dates-index.txt',
  },
  sync: {
    sourcesPath: pathUtils.getRelativePath('../../sources'),
  },
  stopCounter: {
    counterPatternText: 'יום למלחמת אוקראינה-רוסיה',
    stopDate: '12/12/2025',
  },
  search: {
    searchKey: 'עבודה',
    sourcesPath: pathUtils.getRelativePath('../../sources'),
  },
};
