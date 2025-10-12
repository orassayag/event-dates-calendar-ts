/* cSpell:disable */
import { MissingEvent } from '../types';

export const MISSING_EVENTS: MissingEvent[] = [
  {
    includeText: 'אילנות',
    isEveNight: true,
  },
  {
    includeText: 'שביעי של פסח',
    displayText: 'מימונה',
    isEveNight: false,
  },
  {
    includeText: 'הושענא רבה',
    displayText: 'ערב חג סוכות שני',
    isEveNight: false,
  },
  {
    includeText: 'שואה',
    isEveNight: true,
  },
  {
    includeText: 'זכרון',
    excludeText: 'שואה',
    isEveNight: true,
  },
  {
    includeText: 'עצמאות',
    isEveNight: true,
  },
  {
    includeText: 'ט"ו באב',
    isEveNight: true,
  },
];
