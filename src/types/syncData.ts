export interface DayData {
  dateString: string;
  day: number;
  month: number;
  year: number;
  dayTitle: string;
  tasks: string[];
  rawLines: string[];
}

export interface CalculatorState {
  pattern: string;
  lastCount: number;
  currentCount: number;
}

export interface CounterPattern {
  pattern: string;
  baselineValue: number;
  taskTemplate: string;
  position: number;
}

export interface SyncResult {
  sourceFilePath: string;
  archiveFilePath: string;
  distFilePath: string;
  mergedDays: DayData[];
  syncedDays: string[];
  unsyncedDays: string[];
  appliedCounters?: CounterPattern[];
}
