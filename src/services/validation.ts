import { logUtils } from '../utils';

class ValidationService {
  async run(): Promise<void> {
    logUtils.logStatus('VALIDATING SETTINGS');
    // ToDo: split validation to multiple functions, also validate that the source file / event dates index are exists (if the selected script need it).
  }
}

const validationService: ValidationService = new ValidationService();
export { validationService };
