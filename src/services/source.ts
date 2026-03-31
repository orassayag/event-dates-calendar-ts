import {
  eventsSectionSeparator,
  futureEventsSectionSeparator,
  futureEventsSeparator,
  birthDaysSectionSeparator,
  deathDaysSectionSeparator,
  marriageDaysSectionSeparator,
  giftsSectionSeparator,
  discardSectionSeparator,
  pastChargesSectionSeparator,
  sectionDividerSeparator,
} from '../separators';
import { CalendarEvent, EventsAndData, EventType, ExtractSectionEventsParams } from '../types';
import { textUtils } from '../utils';
import { SETTINGS } from '../settings';
import { EXPIRATION_KEYWORDS_REGEX } from '../data';

const { targetYear } = SETTINGS.create;
const DATE_WITH_YEAR_REGEX: RegExp = /^(\d{2})\/(\d{2})\/(\d{4})/;
const DATE_WITHOUT_YEAR_REGEX: RegExp = /^(\d{2})\/(\d{2})(?!\/\d{4})/;
const DATE_WITH_YEAR_ANYWHERE_REGEX: RegExp = /(\d{2})\/(\d{2})\/(\d{4})/;
const DATE_WITHOUT_YEAR_ANYWHERE_REGEX: RegExp = /(\d{2})\/(\d{2})(?!\/\d{4})/;
const NON_LETTER_REGEX: RegExp = /[^א-תa-zA-Z\s]/g;
const LEADING_DASH_REGEX: RegExp = /^-/;

class SourceService {
  /**
   * Parses source file lines into calendar events and header/data sections.
   *
   * @param lines - Raw lines from the source file
   * @returns EventsAndData with events array, headerLines, dataLines, and futureEventLines
   */
  public getSourceEventsAndData(lines: string[]): EventsAndData {
    return this.processLines(lines);
  }

  /**
   * Processes lines into header section, data section, and extracts all events.
   *
   * @param lines - Raw source file lines
   * @returns EventsAndData combining expiration and regular events with header/data/future lines
   */
  private processLines(lines: string[]): EventsAndData {
    const separatorIndex: number = this.findEventsSeparatorIndex(lines);
    const { events: expirationEvents, headerLines, futureEventLines } = this.processHeaderSection(
      lines.slice(0, separatorIndex + 2)
    );
    const { events: regularEvents, dataLines } = this.processDataSection(
      lines.slice(separatorIndex + 2)
    );
    return {
      events: [...expirationEvents, ...regularEvents],
      headerLines,
      dataLines,
      futureEventLines,
    };
  }

  /**
   * Finds the index of the line containing the events section separator.
   *
   * @param lines - Array of lines to search
   * @returns Index of the events separator line, or -1 if not found
   */
  private findEventsSeparatorIndex(lines: string[]): number {
    return lines.findIndex(
      (line: string) => textUtils.cleanLine(line).includes(eventsSectionSeparator)
    );
  }

  /**
   * Processes the header section: discard, past charges, future events, and section-specific events.
   *
   * @param lines - Lines from the header section
   * @returns Object with events array, headerLines, and futureEventLines
   */
  private processHeaderSection(lines: string[]): {
    events: CalendarEvent[];
    headerLines: string[];
    futureEventLines: string[];
  } {
    const events: CalendarEvent[] = [];
    const headerLines: string[] = [];
    const futureEventLines: string[] = [];
    let inDiscardSection: boolean = false;
    let discardSeparatorCount: number = 0;
    let inPastChargesSection: boolean = false;
    let pastChargesSeparatorCount: number = 0;
    let inFutureEventsSection: boolean = false;
    let skipNextEmptyLine: boolean = false;
    for (const rawLine of lines) {
      const line: string = textUtils.cleanLine(rawLine);
      if (line.includes(discardSectionSeparator)) {
        inDiscardSection = true;
        discardSeparatorCount = 0;
        headerLines.push(rawLine);
        continue;
      }
      if (inDiscardSection) {
        if (line === sectionDividerSeparator) {
          discardSeparatorCount++;
          if (discardSeparatorCount === 1) {
            headerLines.push(rawLine);
            continue;
          }
          if (discardSeparatorCount === 2) {
            headerLines.push(rawLine);
            inDiscardSection = false;
            discardSeparatorCount = 0;
            continue;
          }
        }
        continue;
      }
      if (line.includes(pastChargesSectionSeparator)) {
        inPastChargesSection = true;
        pastChargesSeparatorCount = 0;
        headerLines.push(rawLine);
        continue;
      }
      if (inPastChargesSection) {
        headerLines.push(rawLine);
        if (line === sectionDividerSeparator) {
          pastChargesSeparatorCount++;
          if (pastChargesSeparatorCount === 2) {
            inPastChargesSection = false;
            pastChargesSeparatorCount = 0;
          }
        }
        continue;
      }
      if (line.includes(futureEventsSectionSeparator)) {
        inFutureEventsSection = true;
        headerLines.push(rawLine);
        continue;
      }
      if (inFutureEventsSection && line.includes(eventsSectionSeparator)) {
        inFutureEventsSection = false;
        skipNextEmptyLine = false;
        headerLines.push(rawLine);
        continue;
      }
      if (inFutureEventsSection) {
        const futureEventYear: number | undefined = this.extractYearFromLine(line);
        if (futureEventYear && futureEventYear > targetYear) {
          futureEventLines.push(rawLine);
          skipNextEmptyLine = true;
        }
        if (!line) {
          if (!skipNextEmptyLine) {
            headerLines.push(rawLine);
          }
          skipNextEmptyLine = false;
        } else if (line === sectionDividerSeparator) {
          headerLines.push(rawLine);
        }
        continue;
      }
      headerLines.push(rawLine);
      if (!line) {
        continue;
      }
      const expirationEvent: CalendarEvent | undefined =
        this.processExpirationLine(line);
      if (expirationEvent) {
        events.push(expirationEvent);
      }
    }
    const futureEventsEvents: CalendarEvent[] = this.extractSectionEvents({
      lines,
      startSeparator: futureEventsSectionSeparator,
      endSeparator: null,
      processLineFunc: this.processFutureEventsLine.bind(this),
    });
    const birthdayEvents: CalendarEvent[] = this.extractSectionEvents({
      lines,
      startSeparator: birthDaysSectionSeparator,
      endSeparator: deathDaysSectionSeparator,
      processLineFunc: this.processBirthdayLine.bind(this),
    });
    const deathdayEvents: CalendarEvent[] = this.extractSectionEvents({
      lines,
      startSeparator: deathDaysSectionSeparator,
      endSeparator: marriageDaysSectionSeparator,
      processLineFunc: this.processDeathdayLine.bind(this),
    });
    const anniversaryEvents: CalendarEvent[] = this.extractSectionEvents({
      lines,
      startSeparator: marriageDaysSectionSeparator,
      endSeparator: giftsSectionSeparator,
      processLineFunc: this.processAnniversaryLine.bind(this),
    });
    const giftEvents: CalendarEvent[] = this.extractSectionEvents({
      lines,
      startSeparator: giftsSectionSeparator,
      endSeparator: futureEventsSectionSeparator,
      processLineFunc: this.processGiftLine.bind(this),
    });
    events.push(
      ...futureEventsEvents,
      ...birthdayEvents,
      ...deathdayEvents,
      ...anniversaryEvents,
      ...giftEvents
    );
    return { events, headerLines, futureEventLines };
  }

  /**
   * Extracts calendar events from a section between start and end separators using a line processor.
   *
   * @param params - ExtractSectionEventsParams (lines, startSeparator, endSeparator, processLineFunc)
   * @returns Array of CalendarEvent extracted from the section
   */
  private extractSectionEvents(params: ExtractSectionEventsParams): CalendarEvent[] {
    const { lines, startSeparator, endSeparator, processLineFunc } = params;
    const events: CalendarEvent[] = [];
    let inSection: boolean = false;
    for (const rawLine of lines) {
      const line: string = textUtils.cleanLine(rawLine);
      if (line.includes(startSeparator)) {
        inSection = true;
        continue;
      }
      if (endSeparator && line.includes(endSeparator)) {
        inSection = false;
        break;
      }
      if (line === sectionDividerSeparator) {
        continue;
      }
      if (inSection && line) {
        const event: CalendarEvent | undefined = processLineFunc(line);
        if (event) {
          events.push(event);
        }
      }
    }
    return events;
  }

  /**
   * Processes the data section lines into events and preserves raw data lines.
   *
   * @param lines - Lines from the data section (after events separator)
   * @returns Object with events array and dataLines
   */
  private processDataSection(lines: string[]): {
    events: CalendarEvent[];
    dataLines: string[];
  } {
    const events: CalendarEvent[] = [];
    const dataLines: string[] = [];
    let currentType: EventType = EventType.SOURCE;
    for (const rawLine of lines) {
      const line: string = textUtils.cleanLine(rawLine);
      dataLines.push(rawLine);
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

  /**
   * Parses a single line into a CalendarEvent if it contains a valid date for the target year.
   *
   * @param line - Line text to parse
   * @param currentType - Current EventType (SOURCE or FUTURE)
   * @returns CalendarEvent if valid, undefined otherwise
   */
  private processLine(
    line: string,
    currentType: EventType
  ): CalendarEvent | undefined {
    // Skip empty lines and separator lines.
    if (!line) {
      return undefined;
    }
    // Skip lines ending with * (header markers).
    if (line.trim().endsWith('*')) {
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
    // Skip events with a year that doesn't match the target year.
    if (year && year !== targetYear) {
      return undefined;
    }
    // Extract the text before the date.
    const dateString: string = dateMatch[0];
    const dateIndex: number = line.indexOf(dateString);
    let text: string = line.substring(0, dateIndex).trim();
    // Remove leading dash if present.
    text = text.replace(LEADING_DASH_REGEX, '').trim();
    // Remove anything that's not a letter (removes numbers, slashes, dots, colons, etc.).
    text = text.replace(NON_LETTER_REGEX, '').trim();
    return { day, month, year, type: currentType, text };
  }

  /**
   * Parses an expiration line (with expiration keywords and DD/MM/YYYY) into a CalendarEvent.
   *
   * @param line - Line text to parse
   * @returns CalendarEvent of type EXPIRATION if valid, undefined otherwise
   */
  private processExpirationLine(line: string): CalendarEvent | undefined {
    if (!LEADING_DASH_REGEX.test(line)) {
      return undefined;
    }
    if (line.trim().endsWith('*')) {
      return undefined;
    }
    if (!EXPIRATION_KEYWORDS_REGEX.test(line)) {
      return undefined;
    }
    const dateMatch: RegExpMatchArray = line.match(
      DATE_WITH_YEAR_ANYWHERE_REGEX
    );
    if (!dateMatch) {
      return undefined;
    }
    const day: number = parseInt(dateMatch[1]);
    const month: number = parseInt(dateMatch[2]);
    const year: number = parseInt(dateMatch[3]);
    if (year !== targetYear) {
      return undefined;
    }
    const dateString: string = dateMatch[0];
    const dateIndex: number = line.indexOf(dateString);
    const dateEndIndex: number = dateIndex + dateString.length;
    let text: string = line.substring(0, dateEndIndex).trim();
    text = text.replace(LEADING_DASH_REGEX, '').trim();
    return { day, month, year, type: EventType.EXPIRATION, text };
  }

  /**
   * Parses a future events section line into a CalendarEvent of type FUTURE.
   *
   * @param line - Line text to parse
   * @returns CalendarEvent of type FUTURE if valid, undefined otherwise
   */
  private processFutureEventsLine(line: string): CalendarEvent | undefined {
    if (!LEADING_DASH_REGEX.test(line)) {
      return undefined;
    }
    if (line.trim().endsWith('*')) {
      return undefined;
    }
    const dateMatch: RegExpMatchArray = line.match(
      DATE_WITH_YEAR_ANYWHERE_REGEX
    );
    if (!dateMatch) {
      return undefined;
    }
    const day: number = parseInt(dateMatch[1]);
    const month: number = parseInt(dateMatch[2]);
    const year: number = parseInt(dateMatch[3]);
    if (year !== targetYear) {
      return undefined;
    }
    let text: string = line.replace(LEADING_DASH_REGEX, '').trim();
    return { day, month, year, type: EventType.FUTURE, text };
  }

  /**
   * Parses a person event line (birthday, deathday, anniversary) with optional start year.
   *
   * @param line - Line text to parse
   * @param eventType - EventType (BIRTHDAY, DEATHDAY, or ANNIVERSARY)
   * @returns CalendarEvent if valid, undefined otherwise
   */
  private parsePersonEventLine(
    line: string,
    eventType: EventType
  ): CalendarEvent | undefined {
    if (
      eventType === EventType.ANNIVERSARY &&
      EXPIRATION_KEYWORDS_REGEX.test(line)
    ) {
      return undefined;
    }
    if (!LEADING_DASH_REGEX.test(line)) {
      return undefined;
    }
    let dateMatch: RegExpMatchArray | null = line.match(
      DATE_WITH_YEAR_ANYWHERE_REGEX
    );
    let startYear: number | undefined;
    if (dateMatch) {
      startYear = parseInt(dateMatch[3]);
    } else {
      dateMatch = line.match(DATE_WITHOUT_YEAR_ANYWHERE_REGEX);
      if (!dateMatch) {
        return undefined;
      }
    }
    const day: number = parseInt(dateMatch[1]);
    const month: number = parseInt(dateMatch[2]);
    const dateString: string = dateMatch[0];
    const dateIndex: number = line.indexOf(dateString);
    let name: string = line.substring(0, dateIndex).trim();
    name = name.replace(LEADING_DASH_REGEX, '').trim();
    const text: string = `${name} ${dateString}`;
    return { day, month, year: targetYear, type: eventType, text, startYear };
  }

  /**
   * Parses a birthday section line into a CalendarEvent.
   *
   * @param line - Line text to parse
   * @returns CalendarEvent of type BIRTHDAY if valid, undefined otherwise
   */
  private processBirthdayLine(line: string): CalendarEvent | undefined {
    return this.parsePersonEventLine(line, EventType.BIRTHDAY);
  }

  /**
   * Parses a deathday section line into a CalendarEvent.
   *
   * @param line - Line text to parse
   * @returns CalendarEvent of type DEATHDAY if valid, undefined otherwise
   */
  private processDeathdayLine(line: string): CalendarEvent | undefined {
    return this.parsePersonEventLine(line, EventType.DEATHDAY);
  }

  /**
   * Parses an anniversary section line into a CalendarEvent.
   *
   * @param line - Line text to parse
   * @returns CalendarEvent of type ANNIVERSARY if valid, undefined otherwise
   */
  private processAnniversaryLine(line: string): CalendarEvent | undefined {
    return this.parsePersonEventLine(line, EventType.ANNIVERSARY);
  }

  /**
   * Parses a gift section line into a CalendarEvent of type GIFT.
   *
   * @param line - Line text to parse
   * @returns CalendarEvent of type GIFT if valid, undefined otherwise
   */
  private processGiftLine(line: string): CalendarEvent | undefined {
    if (!LEADING_DASH_REGEX.test(line)) {
      return undefined;
    }
    if (line.trim().endsWith('*')) {
      return undefined;
    }
    const dateMatch: RegExpMatchArray = line.match(
      DATE_WITH_YEAR_ANYWHERE_REGEX
    );
    if (!dateMatch) {
      return undefined;
    }
    const day: number = parseInt(dateMatch[1]);
    const month: number = parseInt(dateMatch[2]);
    const year: number = parseInt(dateMatch[3]);
    if (year !== targetYear) {
      return undefined;
    }
    let text: string = line.replace(LEADING_DASH_REGEX, '').trim();
    return { day, month, year, type: EventType.GIFT, text };
  }

  /**
   * Extracts the year from a line containing a DD/MM/YYYY date pattern.
   *
   * @param line - Line text to parse
   * @returns Extracted year if found, undefined otherwise
   */
  private extractYearFromLine(line: string): number | undefined {
    const dateMatch: RegExpMatchArray = line.match(
      DATE_WITH_YEAR_ANYWHERE_REGEX
    );
    if (!dateMatch) {
      return undefined;
    }
    return parseInt(dateMatch[3]);
  }
}

const sourceService: SourceService = new SourceService();
export { sourceService };
