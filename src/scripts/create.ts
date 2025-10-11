import {
  israelDayIdSelector,
  israelDayPersonalSelector,
  israelDaysListSelector,
  israelDaySpansSelector,
} from '../separators';
import { confirmationService, validationService } from '../services';
import { SETTINGS } from '../settings';
import { EventDate, EventType } from '../types';
import { domUtils, logUtils, systemUtils } from '../utils';

const { israelCalendarUrl, targetYear } = SETTINGS.create;

class CreateScript {
  private lastId: number = 1;

  public async run(): Promise<void> {
    // Validate all settings are fit to the user needs.
    await confirmationService.run('create');
    // Validate the settings.
    await validationService.run();
    // Start the create calendar process.
    await this.create();
  }

  private async create(): Promise<void> {
    logUtils.logStatus('CREATE TEXT FILE');
    // First, get all the events from the Israel online calendar website.
    const israelEvents: EventDate[] = await this.createIsraelEvents();
    // Second, get all the events from the United States online calendar website.
    // Third, complete the missing events from the calendar website.
    // In the next step, get all the static events from an event culture file.
    // Next, get all the events from the source event dates TXT file.
    // Next, create the calendar days to log.
    // Finally, log all the days into a new TXT file in the 'dist' directory.
    systemUtils.exit('SCRIPT COMPLETE SUCCESSFULLY');
  }

  private async createIsraelEvents(): Promise<EventDate[]> {
    const dom: any = await domUtils.getDomFromUrl(israelCalendarUrl);
    // Get all days DOM elements from the document.
    const daysList: NodeListOf<Element> = dom.window.document.querySelectorAll(
      israelDaysListSelector
    );
    const events: EventDate[] = [];
    for (const day of daysList) {
      const event: EventDate = this.createIsraelEvent(day);
      if (event) {
        events.push(event);
      }
    }
    return events;
  }

  private createIsraelEvent(dayDom: Element): EventDate | undefined {
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
      eventType: EventType.CALENDAR,
      text: daySpansListDom[1].textContent.trim(),
      targetYear,
      isVacation: false,
    };
  }
}

const createScript: CreateScript = new CreateScript();
export { createScript };
