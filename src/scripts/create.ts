import {
  DYNAMIC_EVENTS,
  MISSING_EVENTS,
  STATIC_EVENTS,
  US_HOLIDAYS_MAP,
  VACATION_KEYWORDS,
} from '../data';
import {
  israelDayIdSelector,
  israelDayPersonalSelector,
  israelDaysListSelector,
  israelDaySpansSelector,
  unitedStatesCellSelector,
  unitedStatesRowSelector,
  unitedStatesTimeStampDataSelector,
} from '../separators';
import {
  eventsService,
  fileReaderService,
  fileWriterService,
  sourceService,
  statisticsService,
  tasksService,
  validationService,
} from '../services';
import { SETTINGS } from '../settings';
import {
  CalendarEvent,
  DynamicEvent,
  EventsAndData,
  EventText,
  EventType,
  MissingEvent,
  RoutineTask,
} from '../types';
import {
  domUtils,
  fileUtils,
  logUtils,
  systemUtils,
  timeUtils,
} from '../utils';

const {
  targetYear,
  israelCalendarUrl,
  unitedStateCalendarUrl,
  eventsIndexPath,
  eventsIndexFallbackPath,
} = SETTINGS.create;
const { sourcePath } = SETTINGS.global;

class CreateScript {
  /**
   * Runs the create script: validates configuration, then creates the events file.
   *
   * @returns Promise that resolves when the script completes
   */
  public async run(): Promise<void> {
    logUtils.logStatus('running: create script');
    await validationService.run('create');
    await this.create();
  }

  /**
   * Orchestrates the full event creation pipeline: Israel events, US events, missing events,
   * static events, source data, routine tasks, and writes the output file.
   *
   * @returns Promise that resolves when creation completes
   */
  private async create(): Promise<void> {
    // First, get all the events from the Israel online calendar website (all days in the year).
    logUtils.logStatus('creating israel events');
    const ilEvents: CalendarEvent[] = await this.createIsraelEvents();
    // Second, get all the events from the United States online calendar website (holidays only).
    logUtils.logStatus('creating united states events');
    const usEvents: CalendarEvent[] = await this.createUnitedStatesEvents();
    // Third, complete the missing events from the Israel calendar website (add eve days, etc).
    logUtils.logStatus('creating missing events');
    const missingEvents: CalendarEvent[] = this.createMissingEvents(ilEvents);
    // In the next step, get all the static events.
    logUtils.logStatus('creating static events');
    const staticEvents: CalendarEvent[] = this.createStaticEvents();
    // Next, read all the data from the current source event dates TXT file.
    logUtils.logStatus('reading source data');
    const lines: string[] = await fileReaderService.readFile(sourcePath);
    // Next, get all the tasks from the event dates index TXT file (daily, monthly, yearly, etc).
    logUtils.logStatus('reading routine tasks data');
    const tasksFilePath: string = await fileUtils.findFile({
      primaryPath: eventsIndexPath,
      fallbackPath: eventsIndexFallbackPath,
      onFallback: (path: string) => {
        logUtils.logError(`NOTE: Using fallback path: ${path}`);
      },
    });
    const tasks: RoutineTask[] =
      await tasksService.getRoutineTasks(tasksFilePath);
    logUtils.logStatus(`loaded ${tasks.length} routine tasks`);
    // Next, load all services, birth dates, death dates, marriage dates, and future events.
    logUtils.logStatus('reading source events data');
    const sourceEvents: EventsAndData =
      sourceService.getSourceEventsAndData(lines);
    const eventsText: EventText[] = eventsService.createEventsText({
      ilEvents,
      usEvents,
      missingEvents,
      staticEvents,
      tasks,
      sourceEvents: sourceEvents.events,
    });
    logUtils.logStatus('writing events file');
    const distFilePath: string = await fileWriterService.writeEventFile({
      eventsText,
      headerLines: sourceEvents.headerLines,
      futureEventLines: sourceEvents.futureEventLines,
    });
    logUtils.logStatus('events dates file has been created successfully');
    await statisticsService.displayCreateStatistics(sourcePath, distFilePath);
    systemUtils.exit('SCRIPT COMPLETE');
  }

  /**
   * Fetches and parses all events from the Israel online calendar website.
   *
   * @returns Promise resolving to an array of calendar events from Israel
   */
  private async createIsraelEvents(): Promise<CalendarEvent[]> {
    const dom: any = await domUtils.getDomFromUrl(israelCalendarUrl);
    // Get all days DOM elements from the document.
    const daysList: NodeListOf<Element> = dom.window.document.querySelectorAll(
      israelDaysListSelector
    );
    const events: CalendarEvent[] = [];
    for (const day of daysList) {
      const event: CalendarEvent = this.createIsraelEvent(day);
      if (event) {
        events.push(event);
      }
    }
    return events;
  }

  /**
   * Parses a single day DOM element into a calendar event.
   *
   * @param dayDom - The day element from the Israel calendar DOM
   * @returns The parsed calendar event, or undefined if invalid or empty
   */
  private createIsraelEvent(dayDom: Element): CalendarEvent | undefined {
    if (!dayDom.textContent.trim()) {
      return undefined;
    }
    const daySpansListDom: HTMLCollectionOf<Element> =
      dayDom.getElementsByTagName(israelDaySpansSelector);
    if (daySpansListDom.length < 1) {
      return undefined;
    }
    // Example of day Id: "id20211214".
    const dayIdDom: string | null = dayDom
      .getElementsByClassName(israelDayPersonalSelector)[0]
      .getAttribute(israelDayIdSelector);
    const day: number = parseInt(`${dayIdDom[8]}${dayIdDom[9]}`);
    const month: number = parseInt(`${dayIdDom[6]}${dayIdDom[7]}`);
    const year: number = parseInt(
      `${dayIdDom[2]}${dayIdDom[3]}${dayIdDom[4]}${dayIdDom[5]}`
    );
    const text: string = daySpansListDom[1]
      ? daySpansListDom[1].textContent.trim()
      : '';
    const isVacation: boolean = this.checkIfVacation(text);
    return {
      day,
      month,
      year,
      type: EventType.CALENDAR,
      text,
      isVacation,
    };
  }

  /**
   * Checks if the event text indicates a vacation day.
   *
   * @param text - The event text to check
   * @returns True if the text contains any vacation keyword
   */
  private checkIfVacation(text: string): boolean {
    return VACATION_KEYWORDS.some((keyword: string) => text.includes(keyword));
  }

  /**
   * Fetches and parses all US holiday events from the United States online calendar.
   *
   * @returns Promise resolving to an array of calendar events from the US (holidays only)
   */
  private async createUnitedStatesEvents(): Promise<CalendarEvent[]> {
    const dom: any = await domUtils.getDomFromUrl(unitedStateCalendarUrl);
    const daysList: NodeListOf<Element> =
      dom.window.document.getElementsByTagName(unitedStatesRowSelector);
    const events: CalendarEvent[] = [];
    const seenEvents = new Set<string>();
    for (const day of daysList) {
      const event: CalendarEvent = this.createUnitedStatesEvent(day);
      if (event) {
        const eventKey: string = `${event.day}-${event.month}-${event.year}-${event.text}`;
        if (!seenEvents.has(eventKey)) {
          seenEvents.add(eventKey);
          events.push(event);
        }
      }
    }
    return events;
  }

  /**
   * Parses a single row DOM element into a US holiday calendar event.
   *
   * @param dayDom - The row element from the US calendar DOM
   * @returns The parsed calendar event, or undefined if not a known holiday
   */
  private createUnitedStatesEvent(dayDom: Element): CalendarEvent | undefined {
    const cell: Element = dayDom.getElementsByTagName(
      unitedStatesCellSelector
    )[1];
    if (!cell?.textContent) {
      return undefined;
    }
    const dayTitle: string = cell.textContent.trim();
    const hebrewText: string | undefined = US_HOLIDAYS_MAP[dayTitle];
    if (!hebrewText) {
      return undefined;
    }
    const dynamicEvent: DynamicEvent | undefined = DYNAMIC_EVENTS.find(
      (e: DynamicEvent) => e.displayText === hebrewText
    );
    const dateTimestamp: string | null = dayDom.getAttribute(
      unitedStatesTimeStampDataSelector
    );
    const { day, month, year } = timeUtils.getDatePartsFromTimeStamp(
      parseInt(dateTimestamp)
    );
    return {
      day,
      month,
      year,
      type: EventType.DYNAMIC,
      text: hebrewText,
      startYear: dynamicEvent?.startYear,
    };
  }

  /**
   * Creates missing events (e.g., eve days) based on Israel events and MISSING_EVENTS config.
   *
   * @param ilEvents - The Israel calendar events to match against
   * @returns Array of missing calendar events
   */
  private createMissingEvents(ilEvents: CalendarEvent[]): CalendarEvent[] {
    const events: CalendarEvent[] = [];
    for (const missingEvent of MISSING_EVENTS) {
      const event: CalendarEvent = this.createMissingEvent(
        ilEvents,
        missingEvent
      );
      if (event) {
        events.push(event);
      }
    }
    return events;
  }

  /**
   * Creates a single missing event by finding a matching Israel event and applying transformations.
   *
   * @param ilEvents - The Israel calendar events to search
   * @param missingEvent - The missing event configuration (include/exclude text, display text, etc.)
   * @returns The created missing event, or undefined if no match found
   */
  private createMissingEvent(
    ilEvents: CalendarEvent[],
    missingEvent: MissingEvent
  ): CalendarEvent | undefined {
    const { includeText, excludeText, displayText, isEveNight } = missingEvent;
    const matchEvent: CalendarEvent | undefined = ilEvents.find(
      (e: CalendarEvent) => {
        const includeMatch: boolean = e.text.includes(includeText);
        const excludeMatch: boolean = excludeText
          ? e.text.includes(excludeText)
          : false;
        return includeMatch && !excludeMatch;
      }
    );
    if (!matchEvent) {
      return undefined;
    }
    const { day, month, year, text } = matchEvent;
    return {
      day: isEveNight ? day - 1 : day,
      month,
      year,
      type: EventType.MISSING,
      text,
      subText: displayText,
      isEveNight,
    };
  }

  /**
   * Creates static events from STATIC_EVENTS configuration for the target year.
   *
   * @returns Array of static calendar events
   */
  private createStaticEvents(): CalendarEvent[] {
    return STATIC_EVENTS.map(({ day, month, text, startYear }) => ({
      day,
      month,
      year: targetYear,
      type: EventType.STATIC,
      text,
      startYear,
    }));
  }
}

export default new CreateScript();
