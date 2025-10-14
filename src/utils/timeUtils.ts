class TimeUtils {
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

  // Create a date for the next month's 0th day (which is the last day of current month).
  public getDaysInMonth(month: number, year: number): number {
    return new Date(year, month, 0).getDate();
  }

  public getDaysCountBetweenDates(startDate: Date, endDate: Date): number {
    const msPerDay: number = 1000 * 60 * 60 * 24;
    const diffInMs: number = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.floor(diffInMs / msPerDay);
  }
}

const timeUtils: TimeUtils = new TimeUtils();
export { timeUtils };
