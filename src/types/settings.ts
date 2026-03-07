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
  // Determine the events dates index directory path which there, the daily and routine events templates are located.
  eventsIndexPath: string;
  // Determine the fallback path for the events dates index file (used if primary path is not found).
  eventsIndexFallbackPath: string;
}

export interface SyncScriptSettings {
  // Determine the sources directory path where source and archive files are located.
  sourcesPath: string;
}

export interface StopCounterScriptSettings {
  // Determine the counter pattern text to match (without the counter number).
  counterPatternText: string;
  // Determine the stop date (DD/MM/YYYY format) or "all" to remove from all days.
  stopDate: string | 'all';
}

export interface SearchScriptSettings {
  // Determine the search key to look for in all text files.
  searchKey: string;
  // Determine the sources directory path where text files are located.
  sourcesPath: string;
}

export interface Settings {
  global: GlobalSettings;
  create: CreateScriptSettings;
  sync: SyncScriptSettings;
  stopCounter: StopCounterScriptSettings;
  search: SearchScriptSettings;
}
