import path from 'path';
import { fileURLToPath } from 'url';
import { Settings } from '../types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const SETTINGS: Settings = {
  GENERAL: {
    APPLICATION_NAME: 'event-dates-calendar',
    CURRENT_YEAR: 2024,
    TARGET_YEAR: 2025,
  },
  URL: {
    VALIDATION_CONNECTION_URL: 'google.com',
    CALENDAR_IL_URL: 'https://calendar.2net.co.il/annual-calendar.aspx?year=',
    CALENDAR_US_URL: 'https://www.timeanddate.com/holidays/us/',
  },
  LOG: {
    DIST_FILE_NAME: 'event-dates',
  },
  COUNT_AND_LIMIT: {
    EXIT_DELAY: 1000,
    MAXIMUM_URL_VALIDATION_COUNT: 5,
    MILLISECONDS_TIMEOUT_URL_VALIDATION: 1000,
    BACKUP_MILLISECONDS_DELAY_VERIFY_BACKUP_COUNT: 1000,
    BACKUP_MAXIMUM_DIRECTORY_VERSIONS_COUNT: 50,
  },
  PATH: {
    SOURCE_PATH: '',
    OUTER_APPLICATION_PATH: '',
    INNER_APPLICATION_PATH: '',
    // SOURCE_PATH: pathUtils.getJoinPath({
    //   targetPath: __dirname,
    //   targetName: '../../sources/event-dates-2024.txt',
    // }),
    // OUTER_APPLICATION_PATH: pathUtils.getJoinPath({
    //   targetPath: __dirname,
    //   targetName: '../../../',
    // }),
    // INNER_APPLICATION_PATH: pathUtils.getJoinPath({
    //   targetPath: __dirname,
    //   targetName: '../../',
    // }),
    APPLICATION_PATH: 'event-dates-calendar',
    BACKUPS_PATH: 'backups',
    DIST_PATH: 'dist',
    NODE_MODULES_PATH: 'node_modules',
    PACKAGE_JSON_PATH: 'package.json',
    PACKAGE_LOCK_JSON_PATH: 'pnpm-lock.yaml',
  },
  BACKUP: {
    IGNORE_DIRECTORIES: ['.git', 'dist', 'node_modules', 'sources'],
    IGNORE_FILES: [],
    INCLUDE_FILES: ['.gitignore'],
  },
};
