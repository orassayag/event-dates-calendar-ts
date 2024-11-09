export type CountAndLimitSettings = {
  // Determine the delay in milliseconds to pause before exiting the application in the end.
  EXIT_DELAY: number;
  // Determine the number of retries to validate the URLs.
  MAXIMUM_URL_VALIDATION_COUNT: number;
  // Determine the milliseconds count timeout to wait between URL validation retry.
  MILLISECONDS_TIMEOUT_URL_VALIDATION: number;
  // Determine the period of time in milliseconds to
  // check that files were created / moved to the target path.
  BACKUP_MILLISECONDS_DELAY_VERIFY_BACKUP_COUNT: number;
  // Determine the number of times in loop to check for version of a backup.
  // For example, if a backup name 'test-test-test-1' exists, it will check for 'test-test-test-2',
  // and so on, until the current maximum number.
  BACKUP_MAXIMUM_DIRECTORY_VERSIONS_COUNT: number;
};
