import { YEAR } from '../place-holders';
import { SETTINGS } from './settings';

export function initiate(): void {
  const {
    targetYear,
    israelCalendarUrl,
    unitedStateCalendarUrl,
    distFileName,
  } = SETTINGS.create;
  SETTINGS.create.israelCalendarUrl = israelCalendarUrl.replace(
    YEAR,
    targetYear
  );
  SETTINGS.create.unitedStateCalendarUrl = unitedStateCalendarUrl.replace(
    YEAR,
    targetYear
  );
  SETTINGS.create.distFileName = distFileName.replace(YEAR, targetYear);
}
