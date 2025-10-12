import { EventType } from './eventType';

export type CalendarEvent = {
  id: number;
  day: number;
  month: number;
  year: number;
  type: EventType;
  text: string;
  subText?: string;
  startYear?: number;
  isVacation?: boolean;
  isEveNight?: boolean;
};
