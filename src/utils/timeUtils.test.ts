import { describe, it, expect, vi } from 'vitest';
import { timeUtils } from './timeUtils';

describe('timeUtils', () => {
  describe('getDatePartsFromTimeStamp', () => {
    it('should extract day, month, and year from a timestamp', () => {
      const timestamp = new Date(2025, 0, 15).getTime();
      const result = timeUtils.getDatePartsFromTimeStamp(timestamp);
      expect(result.day).toBe(15);
      expect(result.month).toBe(1);
      expect(result.year).toBe(2025);
    });
  });

  describe('getDaysInMonth', () => {
    it('should return correct number of days in month', () => {
      expect(timeUtils.getDaysInMonth(2, 2025)).toBe(28);
      expect(timeUtils.getDaysInMonth(2, 2024)).toBe(29);
      expect(timeUtils.getDaysInMonth(4, 2025)).toBe(30);
      expect(timeUtils.getDaysInMonth(1, 2025)).toBe(31);
    });
  });

  describe('isLastDayOfMonth', () => {
    it('should return true if date is last day of month', () => {
      expect(
        timeUtils.isLastDayOfMonth({ day: 31, month: 1, year: 2025 })
      ).toBe(true);
      expect(
        timeUtils.isLastDayOfMonth({ day: 28, month: 2, year: 2025 })
      ).toBe(true);
    });

    it('should return false if date is not last day of month', () => {
      expect(
        timeUtils.isLastDayOfMonth({ day: 30, month: 1, year: 2025 })
      ).toBe(false);
    });
  });

  describe('isQuarterEnd', () => {
    it('should return true for quarter end dates', () => {
      expect(timeUtils.isQuarterEnd(31, 3)).toBe(true);
      expect(timeUtils.isQuarterEnd(30, 6)).toBe(true);
      expect(timeUtils.isQuarterEnd(30, 9)).toBe(true);
      expect(timeUtils.isQuarterEnd(31, 12)).toBe(true);
    });

    it('should return false for non-quarter end dates', () => {
      expect(timeUtils.isQuarterEnd(30, 3)).toBe(false);
      expect(timeUtils.isQuarterEnd(1, 6)).toBe(false);
      expect(timeUtils.isQuarterEnd(31, 4)).toBe(false);
    });
  });

  describe('isHalfYearEnd', () => {
    it('should return true for half-year end dates', () => {
      expect(timeUtils.isHalfYearEnd(30, 6)).toBe(true);
      expect(timeUtils.isHalfYearEnd(31, 12)).toBe(true);
    });

    it('should return false for non-half-year end dates', () => {
      expect(timeUtils.isHalfYearEnd(30, 12)).toBe(false);
      expect(timeUtils.isHalfYearEnd(31, 6)).toBe(false);
    });
  });

  describe('isFriday', () => {
    it('should return true if date is Friday', () => {
      const friday = new Date(2025, 0, 10);
      expect(timeUtils.isFriday(friday)).toBe(true);
    });

    it('should return false if date is not Friday', () => {
      const monday = new Date(2025, 0, 13);
      expect(timeUtils.isFriday(monday)).toBe(false);
    });
  });

  describe('isAlternatingWeekFriday', () => {
    it('should return true for Fridays in odd weeks', () => {
      const friday = new Date(2025, 0, 3);
      expect(timeUtils.isAlternatingWeekFriday(friday)).toBe(true);
    });

    it('should return false for non-Fridays', () => {
      const monday = new Date(2025, 0, 6);
      expect(timeUtils.isAlternatingWeekFriday(monday)).toBe(false);
    });
  });

  describe('isStartOfYear', () => {
    it('should return true for Jan 1st', () => {
      expect(timeUtils.isStartOfYear(1, 1)).toBe(true);
    });

    it('should return false for other dates', () => {
      expect(timeUtils.isStartOfYear(2, 1)).toBe(false);
      expect(timeUtils.isStartOfYear(1, 2)).toBe(false);
    });
  });

  describe('isEndOfYear', () => {
    it('should return true for Dec 31st', () => {
      expect(timeUtils.isEndOfYear(31, 12)).toBe(true);
    });

    it('should return false for other dates', () => {
      expect(timeUtils.isEndOfYear(30, 12)).toBe(false);
      expect(timeUtils.isEndOfYear(31, 11)).toBe(false);
    });
  });
});
