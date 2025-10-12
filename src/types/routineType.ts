export enum RoutineType {
  DAY = 'day',
  WEEKEND = 'weekend',
  WEEKEND_ALT = 'weekend-alt',
  END_MONTH = 'month-end',
  HALF_YEAR = 'half-year',
  YEAR = 'year',
  END_YEAR = 'end-year',
}

export const RoutineTypesMap: Record<string, RoutineType> = {
  '#DAY#': RoutineType.DAY,
  '#WEEKEND#': RoutineType.WEEKEND,
  '#WEEKEND-ALT#': RoutineType.WEEKEND_ALT,
  '#END-MONTH#': RoutineType.END_MONTH,
  '#HALF-YEAR#': RoutineType.HALF_YEAR,
  '#YEAR#': RoutineType.YEAR,
  '#END-YEAR#': RoutineType.END_YEAR,
};
