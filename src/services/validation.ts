import { logUtils } from '../utils';

class ValidationService {
  async run(): Promise<void> {
    logUtils.logStatus('VALIDATING SETTINGS');
  }
}

const validationService: ValidationService = new ValidationService();
export { validationService };
