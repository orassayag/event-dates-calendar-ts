import { ValidationStats, FixedLine, CounterPattern, StopCounterStats } from './index';

export type ValidateAndFixLinesParams = {
  lines: string[];
  stats: ValidationStats;
  fixedLines: FixedLine[];
  counterPatterns: Map<string, CounterPattern>;
};

export type ProcessLinesParams = {
  lines: string[];
  stats: StopCounterStats;
  targetPattern: CounterPattern | undefined;
};
