/**
 * Brawl Stars Client - Main Client Manager
 * Handles all modules, GUI, and core functionality
 */

import { GUIManager } from './gui/GUIManager';
import { ModuleManager } from './modules/ModuleManager';
import { InputManager } from './input/InputManager';
import { ConfigManager } from './config/ConfigManager';

export class BrawlStarsClient {
  private static instance: BrawlStarsClient;
  private guiManager: GUIManager;
  private moduleManager: ModuleManager;
  private inputManager: InputManager;
  private configManager: ConfigManager;
  private isRunning: boolean = false;

  private constructor() {
    this.configManager = new ConfigManager();
    this.moduleManager = new ModuleManager();
    this.inputManager = new InputManager();
    this.guiManager = new GUIManager(this.moduleManager);
    this.setupKeybinds();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): BrawlStarsClient {
    if (!BrawlStarsClient.instance) {
      BrawlStarsClient.instance = new BrawlStarsClient();
    }
    return BrawlStarsClient.instance;
  }

  /**
   * Initialize the client
   */
  public initialize(): void {
    console.log('%c[BRAWL CLIENT] Initializing...', 'color: #00ff00; font-weight: bold;');
    
    this.moduleManager.registerAllModules();
    this.configManager.loadConfig();
    this.isRunning = true;
    
    // Start render loop
    this.startRenderLoop();
    
    console.log('%c[BRAWL CLIENT] Ready! Press [G] to toggle GUI', 'color: #00ff00; font-weight: bold;');
  }

  /**
   * Setup global keybinds
   */
  private setupKeybinds(): void {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      // GUI Toggle - G key
      if (e.code === 'KeyG') {
        this.guiManager.toggleGUI();
      }

      // Pass other keys to module manager for custom keybinds
      this.moduleManager.handleKeyPress(e);
    });
  }

  /**
   * Main render loop
   */
  private startRenderLoop(): void {
    const renderFrame = () => {
      if (this.isRunning) {
        this.moduleManager.updateModules();
        requestAnimationFrame(renderFrame);
      }
    };
    renderFrame();
  }

  /**
   * Get module manager
   */
  public getModuleManager(): ModuleManager {
    return this.moduleManager;
  }

  /**
   * Get GUI manager
   */
  public getGUIManager(): GUIManager {
    return this.guiManager;
  }

  /**
   * Get config manager
   */
  public getConfigManager(): ConfigManager {
    return this.configManager;
  }

  /**
   * Shutdown client
   */
  public shutdown(): void {
    console.log('%c[BRAWL CLIENT] Shutting down...', 'color: #ff0000; font-weight: bold;');
    this.isRunning = false;
    this.guiManager.destroy();
    this.moduleManager.disableAllModules();
  }
}

// Initialize on window load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    BrawlStarsClient.getInstance().initialize();
  });
} else {
  BrawlStarsClient.getInstance().initialize();
}
