class GlobalUtils {
  public async sleep(millisecondsCount: number): Promise<unknown> {
    if (!millisecondsCount) {
      return;
    }
    return await new Promise((resolve) =>
      setTimeout(resolve, millisecondsCount)
    );
  }
}

export default new GlobalUtils();
