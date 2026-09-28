type MutationListener = () => void;

class NotificationEventManager {
  private listeners: Set<MutationListener> = new Set();
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Subscribe to mutation events across the app (mark as read, delete, clear all, new incoming).
   * Returns an unsubscribe function.
   */
  subscribe(listener: MutationListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners that notifications data has been mutated.
   * Debounced slightly to prevent rapid consecutive SQL queries when batch processing.
   */
  notifyMutation(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      this.listeners.forEach((listener) => {
        try {
          listener();
        } catch (err) {
          console.warn('Error in notification mutation listener:', err);
        }
      });
    }, 50);
  }
}

export const notificationEvents = new NotificationEventManager();
