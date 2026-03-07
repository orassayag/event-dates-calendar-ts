import { RoutineTask, RoutineType, RoutineTypesMap } from '../types';
import { textUtils } from '../utils';
import { fileReaderService } from './fileReader';

class TasksService {
  /**
   * Reads a tasks file and parses it into RoutineTask array with types from section headers.
   *
   * @param filePath - Path to the tasks file
   * @returns Promise resolving to array of RoutineTask
   */
  public async getRoutineTasks(filePath: string): Promise<RoutineTask[]> {
    const lines: string[] = await fileReaderService.readFile(filePath);
    return this.processLines(lines);
  }

  /**
   * Processes lines into RoutineTask array using RoutineTypesMap for section type detection.
   *
   * @param lines - Raw file lines
   * @returns Array of RoutineTask with text and type
   */
  private processLines(lines: string[]): RoutineTask[] {
    const routineTasks: RoutineTask[] = [];
    let currentType: RoutineType | undefined;
    for (const rawLine of lines) {
      const line: string = textUtils.cleanLine(rawLine);
      if (!line) {
        continue;
      }
      // Check if this line defines a new type.
      const mappedType: RoutineType = RoutineTypesMap[line];
      if (mappedType) {
        // Update the active section type.
        currentType = mappedType;
        continue;
      }
      // Only add tasks when a valid type is currently set.
      if (currentType) {
        routineTasks.push({ text: line, type: currentType });
      }
    }
    return routineTasks;
  }
}

const tasksService: TasksService = new TasksService();
export { tasksService };
