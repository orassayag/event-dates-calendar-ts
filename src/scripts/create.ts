import { DYNAMIC_EVENTS, MISSING_EVENTS, STATIC_EVENTS } from '../data';
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
  confirmationService,
  fileReaderService,
  tasksService,
  validationService,
} from '../services';
import { SETTINGS } from '../settings';
import {
  CalendarEvent,
  DynamicEvent,
  EventType,
  MissingEvent,
  RoutineTask,
  StaticEvent,
} from '../types';
import { domUtils, logUtils, systemUtils, timeUtils } from '../utils';

const {
  targetYear,
  israelCalendarUrl,
  unitedStateCalendarUrl,
  eventsIndexPath,
} = SETTINGS.create;
const { sourcePath } = SETTINGS.global;

class CreateScript {
  private lastId: number = 1;

  public async run(): Promise<void> {
    // Validate all settings are fit to the user needs.
    // await confirmationService.run('create');
    // Validate the settings.
    await validationService.run();
    // Start the create calendar process.
    await this.create();
  }

  private async create(): Promise<void> {
    // First, get all the events from the Israel online calendar website (all days in the year).
    logUtils.logStatus('CREATING ISRAEL EVENTS');
    const ilEvents: CalendarEvent[] = await this.createIsraelEvents();
    // Second, get all the events from the United States online calendar website (holidays only).
    logUtils.logStatus('CREATING UNITED STATES EVENTS');
    const usEvents: CalendarEvent[] = await this.createUnitedStatesEvents();
    // Third, complete the missing events from the Israel calendar website (add eve days, etc).
    logUtils.logStatus('CREATING MISSING EVENTS');
    const missingEvents: CalendarEvent[] = this.createMissingEvents(ilEvents);
    // In the next step, get all the static events.
    logUtils.logStatus('CREATING STATIC EVENTS');
    const staticEvents: CalendarEvent[] = this.createStaticEvents();
    // Next, read all the data from the current source event dates TXT file.
    logUtils.logStatus('READING SOURCE DATA');
    // const lines: string[] = await fileReaderService.readFile(sourcePath);
    // Next, get all the tasks from the event dates index TXT file (daily, monthly, yearly, etc).
    logUtils.logStatus('READING ROUTINE TASKS DATA');
    const tasks: RoutineTask[] = await tasksService.loadTasks(eventsIndexPath);
    console.log(tasks);
    // Next, load all services, birth dates, death dates, and marriage dates.
    // Next, load all data before the events.
    // Next, load all the future events.
    // Next, create the events dates file.
    logUtils.logStatus('CREATING THE EVENTS DATES FILE');
    // ToDo: Merge all days into 1 array.
    // Finally, log all the days into a new TXT file in the 'dist' directory.
    logUtils.logStatus('EVENTS DATES FILE HAS BEEN CREATED SUCCESSFULLY');
    // ToDo: Log the file.
    systemUtils.exit('SCRIPT COMPLETE');
  }

  // ToDo: Calculate the number years from startYear if exists.

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
    return {
      id: this.lastId++,
      day,
      month,
      year,
      type: EventType.CALENDAR,
      text: daySpansListDom[1] ? daySpansListDom[1].textContent.trim() : '', // ToDo: Handle the culture event text - See the original code.
      isVacation: false, // ToDo: handle the isVacation later - See the original code.
    };
  }

  private async createUnitedStatesEvents(): Promise<CalendarEvent[]> {
    const dom: any = await domUtils.getDomFromUrl(unitedStateCalendarUrl);
    // Get all days DOM elements from the document.
    const daysList: NodeListOf<Element> =
      dom.window.document.getElementsByTagName(unitedStatesRowSelector);
    const events: CalendarEvent[] = [];
    for (const day of daysList) {
      const event: CalendarEvent = this.createUnitedStatesEvent(day);
      if (event) {
        events.push(event);
      }
    }
    // ToDo: uncomment the confirmation service.
    return events;
  }

  private createUnitedStatesEvent(dayDom: Element): CalendarEvent | undefined {
    const cell: Element = dayDom.getElementsByTagName(
      unitedStatesCellSelector
    )[1];
    if (!cell?.textContent) {
      return undefined;
    }
    const dayTitle: string = cell.textContent.trim();
    // Take only the specific dynamic dates from the US calendar.
    const dynamicEvent: DynamicEvent | undefined = DYNAMIC_EVENTS.find(
      (e: DynamicEvent) => e.includeText === dayTitle
    );
    if (!dynamicEvent) {
      return undefined;
    }
    const { displayText, startYear } = dynamicEvent;
    const dateTimestamp: string | null = dayDom.getAttribute(
      unitedStatesTimeStampDataSelector
    );
    const { day, month, year } = timeUtils.getDatePartsFromTimeStamp(
      parseInt(dateTimestamp)
    );
    return {
      id: this.lastId++,
      day,
      month,
      year,
      type: EventType.DYNAMIC,
      text: displayText,
      startYear,
    };
  }

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
      id: this.lastId++,
      day: isEveNight ? day - 1 : day,
      month,
      year,
      type: EventType.MISSING,
      text,
      subText: displayText,
      isEveNight,
    };
  }

  private createStaticEvents(): CalendarEvent[] {
    return STATIC_EVENTS.map(({ day, month, text, startYear }) => ({
      id: this.lastId++,
      day,
      month,
      year: targetYear,
      type: EventType.STATIC,
      text,
      startYear,
    }));
  }
}

const createScript: CreateScript = new CreateScript();
export { createScript };

// ToDo: Need to format events before log them to the file ("-event.") - Create formatter service for this.
