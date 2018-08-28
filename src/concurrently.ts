class Concurrently<T = any> {
  private tasksQueue: (() => Promise<T>)[] = [];
  private tasksActiveCount: number = 0;
  private tasksLimit: number;

  public constructor(tasksLimit: number) {
    if (tasksLimit < 0) {
      throw new Error('Limit cant be lower than 0.');
    }

    this.tasksLimit = tasksLimit;
  }

  private registerTask(handler) {
    this.tasksQueue = [...this.tasksQueue, handler];
    this.executeTasks();
  }

  private executeTasks() {
    while (this.tasksQueue.length && this.tasksActiveCount < this.tasksLimit) {
      const task = this.tasksQueue[0];
      this.tasksQueue = this.tasksQueue.slice(1);
      this.tasksActiveCount += 1;

      task()
        .then((result) => {
          this.tasksActiveCount -= 1;
          this.executeTasks();

          return result;
        })
        .catch((err) => {
          this.tasksActiveCount -= 1;
          this.executeTasks();

          throw err;
        });
    }
  }

  public task(handler: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) =>
      this.registerTask(() =>
        handler()
          .then(resolve)
          .catch(reject),
      ),
    );
  }
}

export default Concurrently;
