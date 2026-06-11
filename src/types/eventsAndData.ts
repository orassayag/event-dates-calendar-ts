import { CalendarEvent } from './index';

export type EventsAndData = {
  events: CalendarEvent[];
  headerLines: string[];
  dataLines: string[];
  futureEventLines: string[];
};
