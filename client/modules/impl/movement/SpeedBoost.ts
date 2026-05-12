/**
 * Speed Boost Module - Increase character movement speed
 */

import { Module, ModuleCategory } from '../../Module';

interface SpeedConfig {
  enabled: boolean;
  multiplier: number; // 1.0 - 3.0
}

export class SpeedBoost extends Module {
  private config: SpeedConfig = {
    enabled: true,
    multiplier: 1.5
  };

  constructor() {
    super('Speed Boost', 'Increase character movement speed', ModuleCategory.MOVEMENT);
    this.setKeybind('KeyV');
  }

  protected onEnable(): void {
    this.applySpeedMultiplier();
    console.log(`%c[SPEED BOOST] Enabled - Multiplier: ${this.config.multiplier}x`, 'color: #00ff00;');
  }

  protected onDisable(): void {
    this.resetSpeedMultiplier();
    console.log('%c[SPEED BOOST] Disabled', 'color: #ff0000;');
  }

  protected onUpdate(): void {
    if (!this.enabled) return;
    this.applySpeedMultiplier();
  }

  /**
   * Apply speed multiplier to game
   */
  private applySpeedMultiplier(): void {
    if ((window as any).setCharacterSpeed) {
      (window as any).setCharacterSpeed(this.config.multiplier);
    }
  }

  /**
   * Reset speed to normal
   */
  private resetSpeedMultiplier(): void {
    if ((window as any).setCharacterSpeed) {
      (window as any).setCharacterSpeed(1.0);
    }
  }

  /**
   * Set speed multiplier
   */
  public setMultiplier(multiplier: number): void {
    this.config.multiplier = Math.max(1.0, Math.min(3.0, multiplier));
    if (this.enabled) {
      this.applySpeedMultiplier();
    }
  }

  public getConfig(): SpeedConfig {
    return this.config;
  }
}
