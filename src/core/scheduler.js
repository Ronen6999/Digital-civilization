// Simplified scheduler for GitHub Actions
// Since GitHub Actions handles scheduling, we just need to determine if we should run

class Scheduler {
  constructor() {
    // No complex scheduling needed - GitHub Actions handles timing
  }

  shouldRunNow() {
    // Always return true when called in GitHub Actions context
    // In a real implementation, you might add logic to check specific conditions
    return true;
  }

  async runOnce(taskFunction) {
    try {
      await taskFunction();
      return true;
    } catch (error) {
      console.error('Error running task:', error);
      return false;
    }
  }
}

module.exports = { Scheduler };

module.exports = { Scheduler };