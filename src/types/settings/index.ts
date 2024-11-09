import { BackupSettings } from './backup.settings';
import { CountAndLimitSettings } from './countLimit.settings';
import { GeneralSettings } from './general.settings';
import { LogSettings } from './log.settings';
import { PathSettings } from './path.settings';
import { URLSettings } from './url.settings';

export type Settings = {
  GENERAL: GeneralSettings;
  URL: URLSettings;
  LOG: LogSettings;
  COUNT_AND_LIMIT: CountAndLimitSettings;
  PATH: PathSettings;
  BACKUP: BackupSettings;
};
