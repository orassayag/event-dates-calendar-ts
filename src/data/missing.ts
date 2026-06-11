import { MissingEvent } from '../types/index';
import { EVENTS_DIRECTORY } from './index';

export const MISSING_EVENTS: MissingEvent[] = [
  {
    includeText: EVENTS_DIRECTORY.ILANOT,
    isEveNight: true,
  },
  {
    includeText: EVENTS_DIRECTORY.PASSOVER_SEVENTH,
    displayText: EVENTS_DIRECTORY.MIMOUNA,
    isEveNight: false,
  },
  {
    includeText: EVENTS_DIRECTORY.HOSHANA_RABBAH,
    displayText: EVENTS_DIRECTORY.SUKKOT_SECOND_EVENING,
    isEveNight: false,
  },
  {
    includeText: EVENTS_DIRECTORY.HOLOCAUST,
    isEveNight: true,
  },
  {
    includeText: EVENTS_DIRECTORY.MEMORY,
    excludeText: EVENTS_DIRECTORY.HOLOCAUST,
    isEveNight: true,
  },
  {
    includeText: EVENTS_DIRECTORY.INDEPENDENCE,
    isEveNight: true,
  },
  {
    includeText: EVENTS_DIRECTORY.TAV_BAV,
    isEveNight: true,
  },
];
