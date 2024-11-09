export type BackupSettings = {
  // Determine the directories to ignore when a backup copy is taking place.
  // For example: 'dist'.
  IGNORE_DIRECTORIES: string[];
  // Determine the files to ignore when the back copy is taking place.
  // For example: 'back_sources_tasks.txt'.
  IGNORE_FILES: string[];
  // Determine the files to force include when the back copy is taking place.
  // For example: '.gitignore'.
  INCLUDE_FILES: string[];
};
