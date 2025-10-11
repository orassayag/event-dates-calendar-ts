import { EventType } from './eventType';

export type EventDate = {
  id: number;
  day: number;
  month: number;
  year: number;
  eventType: EventType;
  text: string;
  targetYear: string;
  isVacation: boolean;
};
