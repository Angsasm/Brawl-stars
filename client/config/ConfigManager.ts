/**
 * Config Manager - Handles loading and saving client configuration
 */

export class ConfigManager {
  private config: Map<string, any> = new Map();
  private storageKey: string = 'brawl_client_config';

  constructor() {
    this.loadConfig();
  }

  /**
   * Load configuration from localStorage
   */
  public loadConfig(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        Object.entries(parsed).forEach(([key, value]) => {
          this.config.set(key, value);
        });
        console.log('%c[CONFIG] Configuration loaded', 'color: #00ff00;');
      }
    } catch (e) {
      console.warn('[CONFIG] Failed to load configuration:', e);
    }
  }

  /**
   * Save configuration to localStorage
   */
  public saveConfig(): void {
    try {
      const obj: any = {};
      this.config.forEach((value, key) => {
        obj[key] = value;
      });
      localStorage.setItem(this.storageKey, JSON.stringify(obj));
      console.log('%c[CONFIG] Configuration saved', 'color: #00ff00;');
    } catch (e) {
      console.warn('[CONFIG] Failed to save configuration:', e);
    }
  }

  /**
   * Get configuration value
   */
  public get(key: string): any {
    return this.config.get(key);
  }

  /**
   * Set configuration value
   */
  public set(key: string, value: any): void {
    this.config.set(key, value);
  }

  /**
   * Remove configuration value
   */
  public remove(key: string): void {
    this.config.delete(key);
  }

  /**
   * Clear all configuration
   */
  public clear(): void {
    this.config.clear();
  }
}
