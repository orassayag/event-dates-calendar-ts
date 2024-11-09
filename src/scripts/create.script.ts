import { Status } from '../types';
import { SystemUtils } from '../utils';
import { ConfirmationService, validationService } from '../services';

class CreateScript {
  private status: Status = Status.READY;

  public async run(): Promise<void> {
    await this.confirm();
    await this.validate();
    await this.initiate();
    await this.create();
  }

  private updateStatus(message: string, status: Status): void {
    this.status = status;
    logUtils.logStatus(message);
  }

  // Let the user confirm all the IMPORTANT settings before the process starts.
  // Validate all settings are fit to the user needs.
  private async confirm(): Promise<void> {
    this.updateStatus('CONFIRM', Status.CONFIRM);
    if (!(await ConfirmationService.confirm())) {
      await SystemUtils.exit(Status.ABORT);
    }
  }

  // Validate the internet connection.
  private async validate(): Promise<void> {
    await validationService.validateURLs();
  }

  // Initiate all the settings, configurations, services, etc.
  private async initiate(): Promise<void> {
    this.updateStatus('INITIATE THE SERVICES', Status.INITIATE);
    await logService.initiate();
  }

  // Start the create calendar process.
  private async create(): Promise<void> {
    this.updateStatus('CREATE THE CALENDAR', Status.START);
    await SystemUtils.exit(Status.SUCCESS);
  }
}

export default new CreateScript();
