import { CalculatorState } from '../types';

const CALCULATOR_PLACEHOLDER: string = '###';
const CALCULATOR_PATTERN: RegExp = /-יום (\d+|###) ל(.+?)\.(\s\*)?$/;
const ENDS_WITH_ASTERISK: RegExp = /\s\*$/;
const ENDS_WITH_DOT: RegExp = /\.$/;

class CalculatorService {
  /**
   * Builds a map of calculator states from source and archive lines by parsing day-counter patterns.
   *
   * @param sourceLines - Raw lines from the source file
   * @param archiveLines - Raw lines from the archive file
   * @returns Map of pattern string to CalculatorState with the highest lastCount per pattern
   */
  public buildCalculatorState(sourceLines: string[], archiveLines: string[]): Map<string, CalculatorState> {
    const calculatorMap: Map<string, CalculatorState> = new Map();
    const allLines: string[] = [...sourceLines, ...archiveLines];
    for (const line of allLines) {
      const trimmedLine: string = line.trim();
      if (!trimmedLine.startsWith('-')) {
        continue;
      }
      const match: RegExpMatchArray | null = trimmedLine.match(CALCULATOR_PATTERN);
      if (!match) {
        continue;
      }
      const countStr: string = match[1];
      const pattern: string = match[2];
      if (countStr === CALCULATOR_PLACEHOLDER) {
        continue;
      }
      const count: number = parseInt(countStr);
      if (isNaN(count)) {
        continue;
      }
      const existingState: CalculatorState | undefined = calculatorMap.get(pattern);
      if (!existingState || count > existingState.lastCount) {
        calculatorMap.set(pattern, {
          pattern,
          lastCount: count,
          currentCount: count,
        });
      }
    }
    return calculatorMap;
  }

  /**
   * Replaces placeholder (###) calculator values in tasks with incremented counter values.
   *
   * @param tasks - Array of task strings that may contain calculator placeholders
   * @param calculatorMap - Map of pattern to CalculatorState (mutated with new currentCount values)
   * @returns Array of tasks with placeholders replaced by counter values and dots followed by asterisk
   */
  public replaceCalculatorsInTasks(tasks: string[], calculatorMap: Map<string, CalculatorState>): string[] {
    return tasks.map((task: string) => {
      if (!task.includes(CALCULATOR_PLACEHOLDER)) {
        return task;
      }
      const match: RegExpMatchArray | null = task.match(CALCULATOR_PATTERN);
      if (!match) {
        return task;
      }
      const pattern: string = match[2];
      let state: CalculatorState | undefined = calculatorMap.get(pattern);
      if (!state) {
        state = { pattern, lastCount: 0, currentCount: 0 };
        calculatorMap.set(pattern, state);
      }
      state.currentCount++;
      return task.replace(CALCULATOR_PLACEHOLDER, state.currentCount.toString()).replace(/\.$/, '. *');
    });
  }

  /**
   * Marks task lines that end with a dot but not an asterisk by appending ' *' to indicate unsynced days.
   *
   * @param tasks - Array of task strings to process
   * @returns Array of tasks with unsynced markers appended where applicable
   */
  public markTasksForUnsyncedDays(tasks: string[]): string[] {
    return tasks.map((task: string) => {
      const trimmedTask: string = task.trim();
      if (!trimmedTask.startsWith('-')) {
        return task;
      }
      if (ENDS_WITH_ASTERISK.test(task)) {
        return task;
      }
      if (ENDS_WITH_DOT.test(task)) {
        return task.replace(/\.$/, '. *');
      } else {
        return task + '. *';
      }
    });
  }

  /**
   * Adds ". *" to tasks that don't already have it, without touching counter placeholders (###).
   * Used for synced days where counters should remain as-is.
   *
   * @param tasks - Array of task strings to process
   * @returns Array of tasks with ". *" added where missing
   */
  public addAsteriskToTasks(tasks: string[]): string[] {
    return tasks.map((task: string) => {
      const trimmedTask: string = task.trim();
      if (!trimmedTask.startsWith('-')) {
        return task;
      }
      if (ENDS_WITH_ASTERISK.test(task)) {
        return task;
      }
      if (ENDS_WITH_DOT.test(task)) {
        return task.replace(/\.$/, '. *');
      }
      return task;
    });
  }
}

const calculatorService: CalculatorService = new CalculatorService();
export { calculatorService };
