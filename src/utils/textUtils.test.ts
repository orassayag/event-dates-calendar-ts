import { describe, it, expect } from 'vitest';
import { textUtils } from './textUtils';

describe('textUtils', () => {
  describe('cleanLine', () => {
    it('should trim whitespace and remove carriage returns and BOM', () => {
      expect(textUtils.cleanLine('  Hello World\r\n')).toBe('Hello World');
      expect(textUtils.cleanLine('\uFEFFTest line\r')).toBe('Test line');
      expect(textUtils.cleanLine('  \t  Clean me  \t  ')).toBe('Clean me');
    });
  });

  describe('containsHebrew', () => {
    it('should return true when text contains Hebrew characters', () => {
      expect(textUtils.containsHebrew('שלום')).toBe(true);
      expect(textUtils.containsHebrew('Hello שלום')).toBe(true);
    });

    it('should return false when text does not contain Hebrew characters', () => {
      expect(textUtils.containsHebrew('Hello World')).toBe(false);
      expect(textUtils.containsHebrew('1234')).toBe(false);
    });
  });

  describe('reverseForRTL', () => {
    it('should reverse a string', () => {
      expect(textUtils.reverseForRTL('Hello')).toBe('olleH');
      expect(textUtils.reverseForRTL('שלום')).toBe('םולש');
      expect(textUtils.reverseForRTL('')).toBe('');
    });
  });
});
