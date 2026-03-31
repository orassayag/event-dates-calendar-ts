import {
  CalendarEvent,
  EventsData,
  EventText,
  RoutineTask,
  RoutineType,
  SyncEventParams,
  ApplicableTasksParams,
} from '../types';
import { timeUtils } from '../utils';
import { SETTINGS } from '../settings';
import { formatterService } from './formatter';
import { HANUKKAH } from '../data/culture';

const { targetYear } = SETTINGS.create;

class EventsService {
  /**
   * Creates formatted event text for all days of the year in chronological order.
   *
   * @param eventsData - Combined events data including IL, US, missing, static, source events and tasks
   * @returns Array of EventText sorted from Jan 1 to Dec 31
   */
  public createEventsText(eventsData: EventsData): EventText[] {
    return this.syncEvents(eventsData);
  }

  /**
   * Syncs all events across 365/366 days, formats texts, and returns events in chronological order.
   *
   * @param eventsData - Combined events data
   * @returns Array of EventText for each day, oldest dates first (Jan 1 to Dec 31)
   */
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
    let dayCounter: number = 1;
    let hanukkahCounter: number = 0;
    let lastHanukkahDayCounter: number = -1;
    for (let month = 1; month <= 12; month++) {
      const daysInMonth: number = timeUtils.getDaysInMonth(month, targetYear);
      for (let day = 1; day <= daysInMonth; day++) {
        const matchingEvents: CalendarEvent[] = allEvents.filter(
          (e: CalendarEvent) => e.day === day && e.month === month
        );
        const hasHanukkah: boolean = matchingEvents.some((e: CalendarEvent) => e.text?.includes(HANUKKAH));
        if (hasHanukkah) {
          if (lastHanukkahDayCounter === dayCounter - 1) {
            hanukkahCounter++;
          } else {
            hanukkahCounter = 0;
          }
          lastHanukkahDayCounter = dayCounter;
        }
        const eventText: EventText = this.syncEvent({
          events: matchingEvents,
          tasks,
          day,
          month,
          dayCounter,
          hanukkahCandleIndex: hasHanukkah ? hanukkahCounter : undefined,
        });
        eventsText.push(eventText);
        dayCounter++;
      }
    }
    return eventsText;
  }

  /**
   * Syncs a single day's events and tasks into formatted event text.
   *
   * @param params - Sync event params (events, tasks, day, month, dayCounter, hanukkahCandleIndex)
   * @returns EventText with date title and formatted lines
   */
  private syncEvent(params: SyncEventParams): EventText {
    const { events, tasks, day, month, dayCounter, hanukkahCandleIndex } = params;
    const lines: string[] = [];
    const currentDate: Date = new Date(targetYear, month - 1, day);
    const { hebrew: dayOfWeekHebrew } =
      formatterService.getDayOfWeek(currentDate);
    const sortedEvents: CalendarEvent[] = this.sortEventsByPriority(events);
    for (const event of sortedEvents) {
      const formattedText: string = formatterService.formatEventText(event, hanukkahCandleIndex);
      if (formattedText) {
        lines.push(formattedText);
      }
      if (event.isVacation) {
        lines.push(formatterService.formatVacationText());
      }
    }
    const applicableTasks: RoutineTask[] = this.getApplicableTasksForDate({
      tasks,
      day,
      month,
      date: currentDate,
    });
    for (const task of applicableTasks) {
      const formattedTask: string = formatterService.formatTaskText(task.text);
      if (formattedTask) {
        lines.push(formattedTask);
      }
    }
    const dateTitle: string = formatterService.formatDateTitle({
      day,
      month,
      dayName: dayOfWeekHebrew,
    });
    return {
      order: dayCounter,
      dateTitle,
      lines,
    };
  }

  /**
   * Sorts calendar events by defined type priority (expiration first, initiate last).
   *
   * @param events - Array of calendar events to sort
   * @returns Sorted array of calendar events
   */
  private sortEventsByPriority(events: CalendarEvent[]): CalendarEvent[] {
    const priorityOrder: Record<string, number> = {
      expiration: 1,
      calendar: 2,
      dynamic: 3,
      static: 4,
      missing: 5,
      birthday: 6,
      deathday: 7,
      anniversary: 8,
      gift: 9,
      source: 10,
      future: 11,
      initiate: 12,
    };
    return events.sort((a: CalendarEvent, b: CalendarEvent) => {
      const priorityA: number = priorityOrder[a.type] || 99;
      const priorityB: number = priorityOrder[b.type] || 99;
      return priorityA - priorityB;
    });
  }

  /**
   * Filters routine tasks by the given routine type.
   *
   * @param tasks - Array of routine tasks
   * @param type - RoutineType to filter by
   * @returns Filtered array of tasks matching the type
   */
  private getTasksByType(
    tasks: RoutineTask[],
    type: RoutineType
  ): RoutineTask[] {
    return tasks.filter((t: RoutineTask) => t.type === type);
  }

  /**
   * Gets all routine tasks applicable to a specific date based on weekday, month end, quarter, etc.
   *
   * @param params - ApplicableTasksParams (tasks, day, month, date)
   * @returns Array of routine tasks applicable to the given date
   */
  private getApplicableTasksForDate(params: ApplicableTasksParams): RoutineTask[] {
    const { tasks, day, month, date } = params;
    const applicableTasks: RoutineTask[] = [];
    applicableTasks.push(...this.getTasksByType(tasks, RoutineType.DAY));
    if (timeUtils.isFriday(date)) {
      applicableTasks.push(...this.getTasksByType(tasks, RoutineType.WEEKEND));
    }
    if (timeUtils.isAlternatingWeekFriday(date)) {
      applicableTasks.push(...this.getTasksByType(tasks, RoutineType.WEEKEND_ALT));
    }
    if (timeUtils.isLastDayOfMonth({ day, month, year: targetYear })) {
      applicableTasks.push(...this.getTasksByType(tasks, RoutineType.END_MONTH));
    }
    if (timeUtils.isQuarterEnd(day, month)) {
      applicableTasks.push(...this.getTasksByType(tasks, RoutineType.QUARTER));
    }
    if (timeUtils.isHalfYearEnd(day, month)) {
      applicableTasks.push(...this.getTasksByType(tasks, RoutineType.HALF_YEAR));
    }
    if (timeUtils.isStartOfYear(day, month)) {
      applicableTasks.push(...this.getTasksByType(tasks, RoutineType.START_YEAR));
    }
    if (timeUtils.isEndOfYear(day, month)) {
      applicableTasks.push(...this.getTasksByType(tasks, RoutineType.END_YEAR));
    }
    return applicableTasks;
  }
}

const eventsService: EventsService = new EventsService();
export { eventsService };
