export type PathSettings = {
  // Determine the path of the event dates source. This file contain all the birthdays, death days, expiration services
  // dates, and other data to be included in the new TXT file.
  SOURCE_PATH: string;
  // Determine the path for the outer application, where other directories located, such as backups, sources, etc...
  // (Working example: 'C:\\Or\\Web\\event-dates-calendar\\').
  OUTER_APPLICATION_PATH: string;
  // Determine the inner application path where all the source of the application is located.
  // (Working example: 'C:\\Or\\Web\\event-dates-calendar\\event-dates-calendar\\').
  INNER_APPLICATION_PATH: string;
  // All these paths will be calculated during runtime in the initial service.
  // DON'T REMOVE THE KEYS, THEY WILL BE CALCULATED TO PATHS DURING RUNTIME.
  // Determine the application path where all the source of the application is located.
  // (Working example: 'C:\\Or\\Web\\event-dates-calendar\\event-dates-calendar').
  APPLICATION_PATH: string;
  // Determine the backups directory which all the local backup will be created to.
  // (Working example: 'C:\\Or\\Web\\event-dates-calendar\\backups').
  BACKUPS_PATH: string;
  // Determine the dist directory path which there, all the outcome of the logs will be created.
  // (Working example: 'C:\\Or\\Web\\event-dates-calendar\\event-dates-calendar\\dist').
  DIST_PATH: string;
  // (Working example: 'C:\\Or\\Web\\event-dates-calendar\\event-dates-calendar\\node_modules').
  NODE_MODULES_PATH: string;
  // (Working example: 'C:\\Or\\Web\\event-dates-calendar\\event-dates-calendar\\package.json').
  PACKAGE_JSON_PATH: string;
  // (Working example: 'C:\\Or\\Web\\event-dates-calendar\\event-dates-calendar\\package-lock.json').
  PACKAGE_LOCK_JSON_PATH: string;
};
