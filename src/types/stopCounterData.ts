export interface StopCounterResult {
  sourceFilePath: string;
  distFilePath: string;
  stats: StopCounterStats;
}

export interface StopCounterStats {
  totalLines: number;
  totalEvents: number;
  totalDays: number;
  eventsMatched: number;
  eventsRemoved: number;
}
