/* cSpell:disable */

export const VACATION_KEYWORDS: string[] = [
  'ערב פסח',
  'פסח',
  'ערב שבועות',
  'שבועות',
  'ערב ראש השנה',
  'ראש השנה',
  'ערב יום כיפור',
  'יום כיפור',
  'ערב סוכות',
  'סוכות',
];

export const VACATION_TEXT: string = 'חופש';

export const ENGLISH_DAYS: string[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const HEBREW_DAYS: string[] = [
  'ראשון',
  'שני',
  'שלישי',
  'רביעי',
  'חמישי',
  'שישי',
  'שבת',
];

export const HANUKKAH = 'חנוכה';
export const HANUKKAH_CANDLES: string[] = [
  'נר ראשון',
  'נר שני',
  'נר שלישי',
  'נר רביעי',
  'נר חמישי',
  'נר שישי',
  'נר שביעי',
  'נר שמיני',
  'איסרו חג',
];

export const EXPIRATION_KEYWORDS_REGEX: RegExp =
  /(בתוקף עד|פג תוקף|תוקף.*עד|עד:)/;

export const EVENTS_DIRECTORY = {
  ILANOT: 'אילנות',
  PASSOVER_SEVENTH: 'שביעי של פסח',
  MIMOUNA: 'מימונה',
  HOSHANA_RABBAH: 'הושענא רבה',
  SUKKOT_SECOND_EVENING: 'ערב חג סוכות שני',
  HOLOCAUST: 'שואה',
  MEMORY: 'זכרון',
  INDEPENDENCE: 'עצמאות',
  TAV_BAV: 'ט"ו באב',
  BLACK_FRIDAY: 'יום שישי השחור - בלאק פריידיי',
  CYBER_MONDAY: 'שני הסייבר - סייבר מאנדיי',
  NEW_YEAR: 'ראש השנה הלועזית החדשה',
  INTERNATIONAL_HOLOCAUST_DAY: 'יום השואה הבינלאומי',
  VALENTINES_DAY: 'יום ולנטיין',
  INTERNATIONAL_WOMENS_DAY: 'יום האישה הבינלאומי',
  APRIL_FOOLS_DAY: 'אחד באפריל - יום השוטים הבינלאומי',
  INTERNATIONAL_WORKERS_DAY: 'יום הפועלים הבינלאומי',
  VICTORY_IN_EUROPE_DAY: 'יום הניצחון באירופה במלחמת העולם השנייה',
  ISRAELI_INDEPENDENCE_DAY: 'יום הקמת מדינת ישראל',
  D_DAY: 'יום הפלישה לנורמנדי - D-Day',
  UNITED_STATES_INDEPENDENCE_DAY: 'יום העצמאות של ארה"ב',
  DEATH_OF_ELIZABETH_II: `יום פטירת מלכת אנגליה אליזבת' השנייה`,
  START_OF_WORLD_WAR_II: 'יום התחלת מלחמת העולם השנייה',
  FIRST_DAY_OF_SCHOOL: 'יום תחילת שנת הלימודים בבתי הספר',
  NINE_ELEVEN_MEMORIAL_DAY: 'יום הזיכרון לפיגוע התיאומים',
  MEMORIAL_DAY_FOR_THE_DEATH_OF_REBIN: 'יום הזיכרון הרשמי לרצח רבין',
  SILVESTER_OF_THE_YEAR: 'ערב השנה החדשה - הסילבסטר',
  MARTIN_LUTHER_KING_DAY: 'יום מרטין לותר קינג',
  LINCOLN_BIRTHDAY: 'יום הולדת לינקולן',
  PRESIDENTS_DAY: 'יום הנשיאים',
  GOOD_FRIDAY: 'יום שישי הטוב',
  TRUMAN_DAY: 'יום טרומן',
  MEMORIAL_DAY_US: 'יום הזיכרון האמריקאי',
  JUNETEENTH: "יום העצמאות של ג'ונטינת'",
  LABOR_DAY_US: 'יום העבודה האמריקאי',
  COLUMBUS_DAY: 'יום קולומבוס',
  INDIGENOUS_PEOPLES_DAY: 'יום העמים הילידים',
  VETERANS_DAY: 'יום הוותיקים',
  THANKSGIVING_DAY: 'יום ההודיה',
  CHRISTMAS_DAY: 'חג המולד',
};

export const US_HOLIDAYS_MAP: Record<string, string> = {
  "New Year's Day": EVENTS_DIRECTORY.NEW_YEAR,
  'Martin Luther King, Jr. Day': EVENTS_DIRECTORY.MARTIN_LUTHER_KING_DAY,
  "Lincoln's Birthday": EVENTS_DIRECTORY.LINCOLN_BIRTHDAY,
  'Presidents Day': EVENTS_DIRECTORY.PRESIDENTS_DAY,
  'Good Friday': EVENTS_DIRECTORY.GOOD_FRIDAY,
  'Truman Day': EVENTS_DIRECTORY.TRUMAN_DAY,
  'Memorial Day': EVENTS_DIRECTORY.MEMORIAL_DAY_US,
  'Juneteenth National Independence Day': EVENTS_DIRECTORY.JUNETEENTH,
  'Independence Day': EVENTS_DIRECTORY.UNITED_STATES_INDEPENDENCE_DAY,
  'Labour Day': EVENTS_DIRECTORY.LABOR_DAY_US,
  'Columbus Day': EVENTS_DIRECTORY.COLUMBUS_DAY,
  "Indigenous Peoples' Day": EVENTS_DIRECTORY.INDIGENOUS_PEOPLES_DAY,
  'Veterans Day': EVENTS_DIRECTORY.VETERANS_DAY,
  'Thanksgiving Day': EVENTS_DIRECTORY.THANKSGIVING_DAY,
  'Christmas Day': EVENTS_DIRECTORY.CHRISTMAS_DAY,
};
