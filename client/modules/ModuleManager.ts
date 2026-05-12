/**
 * Module Manager - Handles registration and management of all modules
 */

import { Module } from './Module';
import { FPSCounter } from './impl/render/FPSCounter';
import { AimAssist } from './impl/combat/AimAssist';
import { ESP } from './impl/render/ESP';
import { BrawlBallHelper } from './impl/combat/BrawlBallHelper';
import { SpeedBoost } from './impl/movement/SpeedBoost';
import { AutoShoot } from './impl/combat/AutoShoot';
import { WallHack } from './impl/render/WallHack';
import { BulletPredictor } from './impl/combat/BulletPredictor';
import { TeleportModule } from './impl/movement/TeleportModule';

export class ModuleManager {
  private modules: Map<string, Module> = new Map();

  /**
   * Register all available modules
   */
  public registerAllModules(): void {
    // Combat Modules
    this.registerModule(new AimAssist());
    this.registerModule(new AutoShoot());
    this.registerModule(new BulletPredictor());
    this.registerModule(new BrawlBallHelper());

    // Render Modules
    this.registerModule(new FPSCounter());
    this.registerModule(new ESP());
    this.registerModule(new WallHack());

    // Movement Modules
    this.registerModule(new SpeedBoost());
    this.registerModule(new TeleportModule());

    console.log(`%c[MODULE MANAGER] Registered ${this.modules.size} modules`, 'color: #00ff00;');
  }

  /**
   * Register a single module
   */
  public registerModule(module: Module): void {
    this.modules.set(module.getName(), module);
  }

  /**
   * Get module by name
   */
  public getModule(name: string): Module | undefined {
    return this.modules.get(name);
  }

  /**
   * Get all modules
   */
  public getAllModules(): Module[] {
    return Array.from(this.modules.values());
  }

  /**
   * Get modules by category
   */
  public getModulesByCategory(category: string): Module[] {
    return Array.from(this.modules.values()).filter(m => m.getCategory().toString() === category);
  }

  /**
   * Toggle module by name
   */
  public toggleModule(name: string): void {
    const module = this.getModule(name);
    if (module) {
      module.toggle();
    }
  }

  /**
   * Enable module by name
   */
  public enableModule(name: string): void {
    const module = this.getModule(name);
    if (module) {
      module.enable();
    }
  }

  /**
   * Disable module by name
   */
  public disableModule(name: string): void {
    const module = this.getModule(name);
    if (module) {
      module.disable();
    }
  }

  /**
   * Disable all modules
   */
  public disableAllModules(): void {
    this.modules.forEach(module => module.disable());
  }

  /**
   * Update all enabled modules
   */
  public updateModules(): void {
    this.modules.forEach(module => module.update());
  }

  /**
   * Handle key press for all modules
   */
  public handleKeyPress(event: KeyboardEvent): void {
    this.modules.forEach(module => module.onKeyPress(event.code));
  }
}
