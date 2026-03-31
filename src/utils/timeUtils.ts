import { IsLastDayOfMonthParams } from '../types';

class TimeUtils {
  /**
   * Extracts day, month, and year from a Unix timestamp.
   *
   * @param timeStamp - Unix timestamp in milliseconds
   * @returns Object with day, month (1-12), and year
   */
  public getDatePartsFromTimeStamp(timeStamp: number): {
    day: number;
    month: number;
    year: number;
  } {
    const date: Date = new Date(timeStamp);
    return {
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    };
  }

  /**
   * Returns the number of days in a given month and year.
   *
   * @param month - Month (1-12)
   * @param year - The year
   * @returns Number of days in the month (28-31)
   */
  public getDaysInMonth(month: number, year: number): number {
    return new Date(year, month, 0).getDate();
  }

  /**
   * Checks if the given date is the last day of its month.
   *
   * @param params - Object containing day, month, and year
   * @returns True if the date is the last day of the month
   */
  public isLastDayOfMonth(params: IsLastDayOfMonthParams): boolean {
    const { day, month, year } = params;
    const daysInMonth: number = this.getDaysInMonth(month, year);
    return day === daysInMonth;
  }

  /**
   * Checks if the given date is a quarter end (Mar 31, Jun 30, Sep 30, or Dec 31).
   *
   * @param day - Day of month
   * @param month - Month (1-12)
   * @returns True if the date is a quarter end
   */
  public isQuarterEnd(day: number, month: number): boolean {
    const quarterEndMonths: number[] = [3, 6, 9, 12];
    if (!quarterEndMonths.includes(month)) {
      return false;
    }
    if (month === 3 || month === 12) {
      return day === 31;
    }
    return day === 30;
  }

  /**
   * Checks if the given date is a half-year end (Jun 30 or Dec 31).
   *
   * @param day - Day of month
   * @param month - Month (1-12)
   * @returns True if the date is a half-year end
   */
  public isHalfYearEnd(day: number, month: number): boolean {
    if (month === 6) {
      return day === 30;
    }
    if (month === 12) {
      return day === 31;
    }
    return false;
  }

  /**
   * Checks if the given date falls on a Friday.
   *
   * @param date - The date to check
   * @returns True if the date is a Friday
   */
  public isFriday(date: Date): boolean {
    return date.getDay() === 5;
  }

  /**
   * Checks if the date is a Friday in an odd ISO week number (alternating weeks).
   *
   * @param date - The date to check
   * @returns True if the date is a Friday in an odd-numbered week
   */
  public isAlternatingWeekFriday(date: Date): boolean {
    if (!this.isFriday(date)) {
      return false;
    }
    const weekNumber: number = this.getWeekNumber(date);
    return weekNumber % 2 === 1;
  }

  /**
   * Checks if the given day and month represent January 1st.
   *
   * @param day - Day of month
   * @param month - Month (1-12)
   * @returns True if the date is the start of the year
   */
  public isStartOfYear(day: number, month: number): boolean {
    return month === 1 && day === 1;
  }

  /**
   * Checks if the given day and month represent December 31st.
   *
   * @param day - Day of month
   * @param month - Month (1-12)
   * @returns True if the date is the end of the year
   */
  public isEndOfYear(day: number, month: number): boolean {
    return month === 12 && day === 31;
  }

  /**
   * Calculates the ISO week number for a given date.
   *
   * @param date - The date to get the week number for
   * @returns The ISO week number (1-53)
   */
  private getWeekNumber(date: Date): number {
    const target: Date = new Date(date.valueOf());
    const dayNumber: number = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNumber + 3);
    const firstThursday: number = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  }
}

const timeUtils: TimeUtils = new TimeUtils();
export { timeUtils };
