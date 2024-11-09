class LogService {
  createConfirmSettingsTemplate(settings) {
    const parameters = ['YEAR', 'DIST_FILE_NAME'];
    let settingsText = Object.keys(settings)
      .filter((s) => parameters.indexOf(s) > -1)
      .map((k) => this.createLineTemplate(k, settings[k]))
      .join('');
    settingsText = textUtils.removeLastCharacters({
      value: settingsText,
      charactersCount: 1,
    });
    return `${textUtils.setLogStatus('IMPORTANT SETTINGS')}
    ${settingsText}
    ========================
    OK to run? (y = yes)`;
  }
}

export default new LogService();
