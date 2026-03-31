export interface FixedLine {
  lineNumber: number;
  originalText: string;
  fixedText: string;
}

export interface ValidationStats {
  totalLines: number;
  totalEvents: number;
  totalDays: number;
  missingStart: number;
  missingEnd: number;
  multipleSpacesFixes: number;
  multipleBlankLinesFixes: number;
  fixedLinesCount: number;
}

export interface CounterPattern {
  eventText: string;
  prefix: string;
  suffix: string;
  occurrences: number;
  lastValue: number;
  isCounter: boolean;
}

export interface CounterOccurrence {
  lineNumber: number;
  lineIndex: number;
  value: number | '###';
  dateString: string;
  fullText: string;
}

export interface ValidationResult {
  sourceFilePath: string;
  distFilePath: string;
  fixedLines: FixedLine[];
  stats: ValidationStats;
}
