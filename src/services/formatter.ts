import { CalendarEvent, EventType, FormatDateTitleParams } from '../types';
import { SETTINGS } from '../settings';
import { ENGLISH_DAYS, HEBREW_DAYS, VACATION_TEXT, HANUKKAH, HANUKKAH_CANDLES } from '../data/culture';

const { targetYear } = SETTINGS.create;

class FormatterService {
  /**
   * Formats a calendar event into display text with Hanukkah candle info and year count when applicable.
   *
   * @param event - Calendar event to format
   * @param hanukkahCandleIndex - Optional index for Hanukkah candle day text
   * @returns Formatted event string with dash prefix and dot suffix, or empty string if no text
   */
  public formatEventText(event: CalendarEvent, hanukkahCandleIndex?: number): string {
    let text: string = event.text;
    if (!text) {
      return '';
    }
    if (text.includes(HANUKKAH) && hanukkahCandleIndex !== undefined && hanukkahCandleIndex >= 0 && hanukkahCandleIndex < HANUKKAH_CANDLES.length) {
      text = `${HANUKKAH} - ${HANUKKAH_CANDLES[hanukkahCandleIndex]}`;
    }
    if (event.subText) {
      text = `${event.subText} ${text.substring(1)}`;
    }
    if (event.startYear !== undefined) {
      const yearsCount: number = targetYear - event.startYear;
      text = `${text} (${yearsCount})`;
    } else if (this.requiresYearDisplay(event.type)) {
      text = `${text} (?)`;
    }
    return this.addPrefix(text);
  }

  /**
   * Determines if the event type should show a year placeholder (?) when startYear is missing.
   *
   * @param type - EventType to check
   * @returns True for birthday, deathday, anniversary
   */
  private requiresYearDisplay(type: EventType): boolean {
    return [EventType.BIRTHDAY, EventType.DEATHDAY, EventType.ANNIVERSARY].includes(type);
  }

  /**
   * Formats a date title string as DD/MM/YYYY followed by the day name in Hebrew.
   *
   * @param params - FormatDateTitleParams (day, month, dayName)
   * @returns Formatted date title string
   */
  public formatDateTitle(params: FormatDateTitleParams): string {
    const { day, month, dayName } = params;
    const dayStr: string = this.padZero(day);
    const monthStr: string = this.padZero(month);
    return `${dayStr}/${monthStr}/${targetYear} ${dayName}`;
  }

  /**
   * Returns the vacation text with dash prefix and dot suffix.
   *
   * @returns Formatted vacation text string
   */
  public formatVacationText(): string {
    return this.addPrefix(VACATION_TEXT);
  }

  /**
   * Formats task text with dash prefix and dot suffix.
   *
   * @param taskText - Raw task text to format
   * @returns Formatted task string, or empty string if input is empty
   */
  public formatTaskText(taskText: string): string {
    return this.addPrefix(taskText);
  }

  /**
   * Adds dash prefix and dot suffix to text for consistent event/task formatting.
   *
   * @param text - Raw text to format
   * @returns Text with "-" prefix and "." suffix, or empty string if trimmed text is empty
   */
  private addPrefix(text: string): string {
    const trimmedText: string = text.trim();
    // Skip empty text to avoid creating lines with just "-.".
    if (!trimmedText) {
      return '';
    }
    const hasDot: boolean = trimmedText.endsWith('.');
    const cleanText: string = hasDot ? trimmedText.slice(0, -1) : trimmedText;
    // Add dash prefix and dot suffix to match expected format.
    return `-${cleanText}.`;
  }

  /**
   * Pads a number with leading zero to two digits.
   *
   * @param num - Number to pad
   * @returns Padded string (e.g., 5 -> "05")
   */
  private padZero(num: number): string {
    return num.toString().padStart(2, '0');
  }

  /**
   * Returns the day of week name in English and Hebrew for a given date.
   *
   * @param date - Date to get day of week for
   * @returns Object with english and hebrew day names
   */
  public getDayOfWeek(date: Date): { english: string; hebrew: string } {
    const dayIndex: number = date.getDay();
    return {
      english: ENGLISH_DAYS[dayIndex],
      hebrew: HEBREW_DAYS[dayIndex],
    };
  }
}

const formatterService: FormatterService = new FormatterService();
export { formatterService };
