import { CalendarEvent } from './calendarEvent';
import { RoutineTask } from './routineTask';

export type EventsData = {
  ilEvents: CalendarEvent[];
  usEvents: CalendarEvent[];
  missingEvents: CalendarEvent[];
  staticEvents: CalendarEvent[];
  tasks: RoutineTask[];
  sourceEvents: CalendarEvent[];
};
