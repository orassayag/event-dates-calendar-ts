import { CalendarEvent, EventText } from './index';

export type ExtractSectionEventsParams = {
  lines: string[];
  startSeparator: string;
  endSeparator: string | null;
  processLineFunc: (line: string) => CalendarEvent | undefined;
};

export type WriteEventFileParams = {
  eventsText: EventText[];
  headerLines: string[];
  futureEventLines: string[];
};
