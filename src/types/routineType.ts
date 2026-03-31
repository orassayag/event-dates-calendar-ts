export enum RoutineType {
  DAY = 'day',
  WEEKEND = 'weekend',
  WEEKEND_ALT = 'weekend-alt',
  END_MONTH = 'month-end',
  QUARTER = 'quarter',
  HALF_YEAR = 'half-year',
  START_YEAR = 'start-year',
  END_YEAR = 'end-year',
}

export const RoutineTypesMap: Record<string, RoutineType> = {
  '#DAY#': RoutineType.DAY,
  '#WEEKEND#': RoutineType.WEEKEND,
  '#WEEKEND-ALT#': RoutineType.WEEKEND_ALT,
  '#END-MONTH#': RoutineType.END_MONTH,
  '#QUARTER#': RoutineType.QUARTER,
  '#HALF-YEAR#': RoutineType.HALF_YEAR,
  '#START-YEAR#': RoutineType.START_YEAR,
  '#END-YEAR#': RoutineType.END_YEAR,
};
