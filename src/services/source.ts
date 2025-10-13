import { endOfScrapeSeparator, futureEventsSeparator } from '../separators';
import { CalendarEvent, EventsAndData, EventType } from '../types';
import { textUtils } from '../utils';

const DATE_WITH_YEAR_REGEX: RegExp = /(\d{2})\/(\d{2})\/(\d{4})/;
const DATE_WITHOUT_YEAR_REGEX: RegExp = /(\d{2})\/(\d{2})(?!\/\d{4})/;
const NON_LETTER_REGEX: RegExp = /[^א-תa-zA-Z\s]/g;
const LEADING_DASH_REGEX: RegExp = /^-/;

class SourceService {
  public getSourceEventsAndData(lines: string[]): EventsAndData {
    return this.processLines(lines);
  }

  private processLines(lines: string[]): EventsAndData {
    const events: CalendarEvent[] = [];
    const dataLines: string[] = [];
    let currentType: EventType = EventType.SOURCE;
    for (const rawLine of lines) {
      dataLines.push(rawLine);
      const line: string = textUtils.cleanLine(rawLine);
      if (line === endOfScrapeSeparator) {
        break;
      }
      if (line.includes(futureEventsSeparator)) {
        currentType = EventType.FUTURE;
        continue;
      }
      const event: CalendarEvent | undefined = this.processLine(
        line,
        currentType
      );
      if (event) {
        events.push(event);
      }
    }
    return { events, dataLines };
  }

  private processLine(
    line: string,
    currentType: EventType
  ): CalendarEvent | undefined {
    // Skip empty lines and separator lines.
    if (!line) {
      return undefined;
    }
    // Extract date with year: DD/MM/YYYY.
    let dateMatch: RegExpMatchArray = line.match(DATE_WITH_YEAR_REGEX);
    let hasYear: boolean = true;
    // If no year found, try to match date without year: DD/MM.
    if (!dateMatch) {
      dateMatch = line.match(DATE_WITHOUT_YEAR_REGEX);
      hasYear = false;
    }
    // Only create an event if the line contains a date.
    if (!dateMatch) {
      return undefined;
    }
    const day: number = parseInt(dateMatch[1]);
    const month: number = parseInt(dateMatch[2]);
    const year: number | undefined = hasYear
      ? parseInt(dateMatch[3])
      : undefined;
    // Extract the text before the date.
    const dateString = dateMatch[0];
    const dateIndex = line.indexOf(dateString);
    let text = line.substring(0, dateIndex).trim();
    // Remove leading dash if present.
    text = text.replace(LEADING_DASH_REGEX, '').trim();
    // Remove anything that's not a letter (removes numbers, slashes, dots, colons, etc.).
    text = text.replace(NON_LETTER_REGEX, '').trim();
    return { day, month, year, type: currentType, text };
  }
}

const sourceService: SourceService = new SourceService();
export { sourceService };
