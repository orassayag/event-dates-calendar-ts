import { DayData, CalculatorState } from './index';

export type MergeDaysParams = {
  sourceDays: DayData[];
  archiveDays: DayData[];
  calculatorMap: Map<string, CalculatorState>;
};

export type WriteMergedFileParams = {
  mergedDays: DayData[];
  sourceLines: string[];
  year: number;
};
