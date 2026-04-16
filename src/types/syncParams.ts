import { DayData } from './index';

export type MergeDaysParams = {
  sourceDays: DayData[];
  archiveDays: DayData[];
};

export type WriteMergedFileParams = {
  mergedDays: DayData[];
  sourceLines: string[];
  year: number;
};
