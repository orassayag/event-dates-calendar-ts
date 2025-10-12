export interface GlobalSettings {
  // Determine the path of the event dates source. This file contain all the birthdays, deathdays, expiration services
  // dates, and other data to be included in the new TXT file.
  sourcePath: string;
  // Determine the dist directory path which there, all the outcome of the logs will be created.
  distPath: string;
}

export interface CreateScriptSettings {
  // Determine the year to create the event dates calendar for.
  targetYear: number;
  // Determine the URL of which to take the calendar Hebrew events and holidays.
  israelCalendarUrl: string;
  // Determine the URL of which to take the calendar United States events and holidays.
  unitedStateCalendarUrl: string;
  // Determine the name of the resulting `event dates` new TXT file in the 'dist' directory.
  distFileName: string;
}

export interface Settings {
  global: GlobalSettings;
  create: CreateScriptSettings;
}
