import { CalendarEvent } from './calendarEvent';

export type EventsAndData = {
  events: CalendarEvent[];
  headerLines: string[];
  dataLines: string[];
  futureEventLines: string[];
};
