import { CalendarEvent, EventsData, EventText, RoutineTask } from '../types';
import { timeUtils } from '../utils';
import { SETTINGS } from '../settings';

const { targetYear } = SETTINGS.create;

class EventsService {
  // First, merge all the events into 1 year (365 objects).
  // Then, calculate the counters of the events.
  // Next, format all the texts and convert to event text object.
  // Finally, order the events.
  public createEventsText(eventsData: EventsData): EventText[] {
    this.syncEvents(eventsData);
    return [];
  }

  private syncEvents(eventsData: EventsData): EventText[] {
    const {
      ilEvents,
      usEvents,
      missingEvents,
      staticEvents,
      tasks,
      sourceEvents,
    } = eventsData;
    const allEvents: CalendarEvent[] = [
      ...ilEvents,
      ...usEvents,
      ...missingEvents,
      ...staticEvents,
      ...sourceEvents,
    ];
    const eventsText: EventText[] = [];
    const currentYear: number = new Date().getFullYear();
    // Loop through all 365/366 days of the year.
    for (let month = 1; month <= 12; month++) {
      const daysInMonth: number = timeUtils.getDaysInMonth(month, currentYear);
      for (let day = 1; day <= daysInMonth; day++) {
        // Filter events that match this specific day and month.
        const matchingEvents: CalendarEvent[] = allEvents.filter(
          (e: CalendarEvent) => e.day === day && e.month === month
        );
        // Sync event for this specific day with all matching events.
        const eventText: EventText = this.syncEvent(
          matchingEvents,
          tasks,
          day,
          month
        );
        eventsText.push(eventText);
      }
    }
    return eventsText;
  }

  private syncEvent(
    events: CalendarEvent[],
    tasks: RoutineTask[],
    day: number,
    month: number
  ): EventText {
    const lines: string[];
    events.forEach((e: CalendarEvent) => {
      const {} = e;
    });

    // ToDo: Sync and calculate counters of dates.
    // ToDo: Calculate the number years from startYear if exists.
    // ToDo: Need to format events before log them to the file ("-event.")
    return {} as EventText;
  }
}

const eventsService: EventsService = new EventsService();
export { eventsService };

// ToDo: Merge all days into 1 array.
// ToDo: Sync and calculate counters of dates.
// ToDo: Calculate the number years from startYear if exists.
// ToDo: Need to format events before log them to the file ("-event.") - Create formatter service for this.
// ToDo: Need to sort the events on the opposite direction.
