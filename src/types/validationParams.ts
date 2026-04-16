import { ValidationStats, FixedLine, ValidationCounterPattern, StopCounterStats } from './index';

export type ValidateAndFixLinesParams = {
  lines: string[];
  stats: ValidationStats;
  fixedLines: FixedLine[];
  counterPatterns: Map<string, ValidationCounterPattern>;
};

export type ProcessLinesParams = {
  lines: string[];
  stats: StopCounterStats;
  targetPattern: ValidationCounterPattern | undefined;
};
