import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logUtils } from './logUtils';

describe('logUtils', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('log', () => {
    it('should log a message to console', () => {
      const message = 'test message';
      logUtils.log(message);
      expect(console.log).toHaveBeenCalledWith(message);
    });
  });

  describe('logStatus', () => {
    it('should log a status message in uppercase with delimiters', () => {
      logUtils.logStatus('test');
      expect(console.log).toHaveBeenCalledWith('===TEST===');
    });
  });

  describe('logError', () => {
    it('should log an error message with delimiters', () => {
      logUtils.logError('test error');
      expect(console.log).toHaveBeenCalledWith('===test error===');
    });
  });
});
