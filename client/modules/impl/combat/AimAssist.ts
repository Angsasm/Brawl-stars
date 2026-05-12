/**
 * Aim Assist Module - Subtle, configurable aim assistance
 */

import { Module, ModuleCategory } from '../../Module';

interface AimConfig {
  enabled: boolean;
  strength: number; // 0.1 - 1.0
  range: number; // pixels
  smoothness: number; // 0.1 - 1.0
}

export class AimAssist extends Module {
  private config: AimConfig = {
    enabled: true,
    strength: 0.3,
    range: 200,
    smoothness: 0.5
  };

  private lastAimPos = { x: 0, y: 0 };
  private targetPos = { x: 0, y: 0 };

  constructor() {
    super('Aim Assist', 'Subtle configurable aim assistance', ModuleCategory.COMBAT);
    this.setKeybind('KeyU');
  }

  protected onEnable(): void {
    console.log('%c[AIM ASSIST] Enabled - Strength: ' + this.config.strength, 'color: #00ff00;');
  }

  protected onDisable(): void {
    console.log('%c[AIM ASSIST] Disabled', 'color: #ff0000;');
  }

  protected onUpdate(): void {
    if (!this.enabled) return;

    const mousePos = this.getMousePosition();
    const nearestEnemy = this.findNearestEnemy(mousePos);

    if (nearestEnemy) {
      const targetX = nearestEnemy.x;
      const targetY = nearestEnemy.y;

      // Smooth aim assist (non-snappy)
      this.lastAimPos.x += (targetX - this.lastAimPos.x) * this.config.smoothness * this.config.strength;
      this.lastAimPos.y += (targetY - this.lastAimPos.y) * this.config.smoothness * this.config.strength;

      this.applyAimCorrection(this.lastAimPos.x, this.lastAimPos.y);
    }
  }

  /**
   * Get mouse position
   */
  private getMousePosition(): { x: number; y: number } {
    // Implementation depends on game client
    // Using document.body as fallback for demo
    return {
      x: (window as any).gameMouseX || 0,
      y: (window as any).gameMouseY || 0
    };
  }

  /**
   * Find nearest enemy within range
   */
  private findNearestEnemy(mousePos: { x: number; y: number }): { x: number; y: number } | null {
    const enemies = this.getVisibleEnemies();
    let nearest: { x: number; y: number; distance: number } | null = null;

    enemies.forEach((enemy: any) => {
      const dx = enemy.x - mousePos.x;
      const dy = enemy.y - mousePos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.config.range) {
        if (!nearest || distance < nearest.distance) {
          nearest = { x: enemy.x, y: enemy.y, distance };
        }
      }
    });

    return nearest ? { x: nearest.x, y: nearest.y } : null;
  }

  /**
   * Get visible enemies (hook into game API)
   */
  private getVisibleEnemies(): any[] {
    // This should be connected to the game's entity system
    return (window as any).gameEnemies || [];
  }

  /**
   * Apply aim correction to input
   */
  private applyAimCorrection(x: number, y: number): void {
    // Modify game input (implementation depends on game client)
    if ((window as any).setGameAim) {
      (window as any).setGameAim(x, y);
    }
  }

  /**
   * Set aim assist strength (0.1 - 1.0)
   */
  public setStrength(strength: number): void {
    this.config.strength = Math.max(0.1, Math.min(1.0, strength));
  }

  /**
   * Set aim assist range
   */
  public setRange(range: number): void {
    this.config.range = Math.max(50, Math.min(500, range));
  }

  /**
   * Set smoothness (0.1 - 1.0)
   */
  public setSmoothness(smoothness: number): void {
    this.config.smoothness = Math.max(0.1, Math.min(1.0, smoothness));
  }

  public getConfig(): AimConfig {
    return this.config;
  }
}
