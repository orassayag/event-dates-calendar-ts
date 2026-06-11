import { describe, it, expect } from 'vitest';
import { calculatorService } from './calculator';

describe('calculatorService', () => {
  describe('buildCalculatorState', () => {
    it('should build calculator state from source and archive lines', () => {
      const sourceLines = [
        '-יום 100 למישהו.',
        '-יום 101 למישהו.',
        '-יום 50 למישהו אחר.',
      ];
      const archiveLines = ['-יום 99 למישהו.', '-יום 49 למישהו אחר.'];

      const result = calculatorService.buildCalculatorState(
        sourceLines,
        archiveLines
      );

      expect(result.get('מישהו')).toEqual({
        pattern: 'מישהו',
        lastCount: 101,
        currentCount: 101,
      });
      expect(result.get('מישהו אחר')).toEqual({
        pattern: 'מישהו אחר',
        lastCount: 50,
        currentCount: 50,
      });
    });

    it('should ignore placeholder values (###)', () => {
      const sourceLines = ['-יום ### למישהו.'];
      const archiveLines = [];
      const result = calculatorService.buildCalculatorState(
        sourceLines,
        archiveLines
      );
      expect(result.size).toBe(0);
    });
  });

  describe('replaceCalculatorsInTasks', () => {
    it('should replace calculator placeholders with incremented counts', () => {
      const tasks = ['-יום ### למישהו.', '-יום ### למישהו אחר.'];
      const calculatorMap = new Map([
        ['מישהו', { pattern: 'מישהו', lastCount: 100, currentCount: 100 }],
        [
          'מישהו אחר',
          { pattern: 'מישהו אחר', lastCount: 50, currentCount: 50 },
        ],
      ]);

      const result = calculatorService.replaceCalculatorsInTasks(
        tasks,
        calculatorMap
      );

      expect(result[0]).toBe('-יום 101 למישהו. *');
      expect(result[1]).toBe('-יום 51 למישהו אחר. *');
      expect(calculatorMap.get('מישהו')?.currentCount).toBe(101);
    });
  });

  describe('markTasksForUnsyncedDays', () => {
    it('should add . * to tasks that end with .', () => {
      const tasks = ['-תשימית.', '-תשימית כבר מסומן. *', 'תאריך'];
      const result = calculatorService.markTasksForUnsyncedDays(tasks);
      expect(result[0]).toBe('-תשימית. *');
      expect(result[1]).toBe('-תשימית כבר מסומן. *');
    });
  });

  describe('addAsteriskToTasks', () => {
    it('should add . * to tasks that end with .', () => {
      const tasks = ['-תשימית.', '-תשימית כבר מסומן. *', '-יום ### למישהו.'];
      const result = calculatorService.addAsteriskToTasks(tasks);
      expect(result[0]).toBe('-תשימית. *');
      expect(result[1]).toBe('-תשימית כבר מסומן. *');
      expect(result[2]).toBe('-יום ### למישהו. *');
    });
  });
});
