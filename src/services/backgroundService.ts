
import { scheduleService } from './scheduleService';

class BackgroundService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  start() {
    if (this.isRunning) {
      console.log('Background service already running');
      return;
    }

    console.log('Starting background schedule status service...');
    this.isRunning = true;

    // Check for status updates every 2 minutes
    this.intervalId = setInterval(async () => {
      try {
        await scheduleService.refreshScheduleStatuses();
      } catch (error) {
        console.error('Background service error:', error);
      }
    }, 2 * 60 * 1000); // 2 minutes
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Background service stopped');
  }

  restart() {
    this.stop();
    this.start();
  }
}

export const backgroundService = new BackgroundService();
