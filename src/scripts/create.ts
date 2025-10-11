import { confirmationService, validationService } from '../services';

class CreateScript {
  public async run(): Promise<void> {
    // Validate all settings are fit to the user needs.
    await confirmationService.run('create');
    // Validate the settings.
    await validationService.run();
    // Start the create calendar process.
    await this.create();
  }

  private async create(): Promise<void> {}
}

const createScript: CreateScript = new CreateScript();
export { createScript };
