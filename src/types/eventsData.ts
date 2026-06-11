import { CalendarEvent } from './index';
import { RoutineTask } from './index';

export type EventsData = {
  ilEvents: CalendarEvent[];
  usEvents: CalendarEvent[];
  missingEvents: CalendarEvent[];
  staticEvents: CalendarEvent[];
  tasks: RoutineTask[];
  sourceEvents: CalendarEvent[];
};
