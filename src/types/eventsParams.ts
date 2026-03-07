import { CalendarEvent, RoutineTask } from './index';

export type SyncEventParams = {
  events: CalendarEvent[];
  tasks: RoutineTask[];
  day: number;
  month: number;
  dayCounter: number;
  hanukkahCandleIndex?: number;
};

export type ApplicableTasksParams = {
  tasks: RoutineTask[];
  day: number;
  month: number;
  date: Date;
};

export type FormatDateTitleParams = {
  day: number;
  month: number;
  dayName: string;
};
