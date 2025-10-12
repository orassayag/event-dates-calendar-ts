import { DYNAMIC_EVENTS, MISSING_EVENTS } from '../data';
import {
  israelDayIdSelector,
  israelDayPersonalSelector,
  israelDaysListSelector,
  israelDaySpansSelector,
  unitedStatesCellSelector,
  unitedStatesRowSelector,
  unitedStatesTimeStampDataSelector,
} from '../separators';
import { confirmationService, validationService } from '../services';
import { SETTINGS } from '../settings';
import { CalendarEvent, DynamicEvent, EventType, MissingEvent } from '../types';
import { domUtils, logUtils, systemUtils, timeUtils } from '../utils';

const { targetYear, israelCalendarUrl, unitedStateCalendarUrl } =
  SETTINGS.create;

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
    logUtils.logStatus('CREATE TEXT FILE');
    // First, get all the events from the Israel online calendar website.
    const ilEvents: CalendarEvent[] = await this.createIsraelEvents();
    // Second, get all the events from the United States online calendar website.
    const usEvents: CalendarEvent[] = await this.createUnitedStatesEvents();
    // Third, complete the missing events from the Israel calendar website (add eve days, etc).
    const missingEvents: CalendarEvent[] = this.createMissingEvents(ilEvents);
    // In the next step, get all the static events from an event culture file.
    // Next, get all the events from the source event dates TXT file.
    // Next, create the calendar days to log.
    // Finally, log all the days into a new TXT file in the 'dist' directory.
    systemUtils.exit('SCRIPT COMPLETE SUCCESSFULLY');
  }

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
    if (daySpansListDom.length < 2) {
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
      text: daySpansListDom[1].textContent.trim(), // ToDo: Handle the culture event text - See the original code.
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
}

const createScript: CreateScript = new CreateScript();
export { createScript };

// ToDo: Need to format events before log them to the file ("-event.") - Create formatter service for this.
