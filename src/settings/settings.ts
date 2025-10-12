import { YEAR } from '../place-holders';
import { Settings } from '../types';
import { pathUtils } from '../utils';

export const SETTINGS: Settings = {
  global: {
    sourcePath: pathUtils.getRelativePath('../../sources/event-dates-2024.txt'),
    distPath: pathUtils.getRelativePath('../../dist'),
  },
  create: {
    targetYear: 2025,
    israelCalendarUrl: `https://calendar.2net.co.il/annual-calendar.aspx?year=${YEAR}`,
    unitedStateCalendarUrl: `https://www.timeanddate.com/holidays/us/${YEAR}`,
    distFileName: `event-dates-${YEAR}`,
    eventsIndexPath:
      'C:\\Users\\Or Assayag\\Dropbox\\or-life\\documents\\daily\\event-dates-index.txt',
  },
};
