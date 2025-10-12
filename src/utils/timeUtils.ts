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
}

const timeUtils: TimeUtils = new TimeUtils();
export { timeUtils };
