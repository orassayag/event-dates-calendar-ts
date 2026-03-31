import { DynamicEvent } from '../types';
import { EVENTS_DIRECTORY } from './culture';

export const DYNAMIC_EVENTS: DynamicEvent[] = [
  {
    includeText: 'Black Friday',
    displayText: EVENTS_DIRECTORY.BLACK_FRIDAY,
    startYear: 1869,
  },
  {
    includeText: 'Cyber Monday',
    displayText: EVENTS_DIRECTORY.CYBER_MONDAY,
    startYear: 2005,
  },
  {
    includeText: 'Independence Day',
    displayText: EVENTS_DIRECTORY.UNITED_STATES_INDEPENDENCE_DAY,
    startYear: 1776,
  },
  {
    includeText: 'Presidents Day',
    displayText: EVENTS_DIRECTORY.PRESIDENTS_DAY,
    startYear: 1971,
  },
  {
    includeText: 'Good Friday',
    displayText: EVENTS_DIRECTORY.GOOD_FRIDAY,
    startYear: 33,
  },
  {
    includeText: 'Truman Day',
    displayText: EVENTS_DIRECTORY.TRUMAN_DAY,
    startYear: 1949,
  },
  {
    includeText: 'Memorial Day',
    displayText: EVENTS_DIRECTORY.MEMORIAL_DAY_US,
    startYear: 1868,
  },
  {
    includeText: 'Labor Day',
    displayText: EVENTS_DIRECTORY.LABOR_DAY_US,
    startYear: 1894,
  },
  {
    includeText: 'Columbus Day',
    displayText: EVENTS_DIRECTORY.COLUMBUS_DAY,
    startYear: 1937,
  },
  {
    includeText: "Indigenous Peoples' Day",
    displayText: EVENTS_DIRECTORY.INDIGENOUS_PEOPLES_DAY,
    startYear: 2021,
  },
  {
    includeText: 'Thanksgiving Day',
    displayText: EVENTS_DIRECTORY.THANKSGIVING_DAY,
    startYear: 1863,
  },
];
