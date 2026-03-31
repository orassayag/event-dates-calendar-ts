import { YEAR } from '../place-holders';
import { SETTINGS } from './settings';

export function initiate(): void {
  const {
    targetYear,
    israelCalendarUrl,
    unitedStateCalendarUrl,
    distFileName,
  } = SETTINGS.create;
  const targetYearString: string = targetYear.toString();
  SETTINGS.create.israelCalendarUrl = israelCalendarUrl.replace(
    YEAR,
    targetYearString
  );
  SETTINGS.create.unitedStateCalendarUrl = unitedStateCalendarUrl.replace(
    YEAR,
    targetYearString
  );
  SETTINGS.create.distFileName = distFileName.replace(YEAR, targetYearString);
}
