/**
 * Auto Shoot Module - Automatically shoot at enemies
 */

import { Module, ModuleCategory } from '../../Module';

interface AutoShootConfig {
  enabled: boolean;
  range: number;
  fireRate: number; // milliseconds
  targetPriority: 'nearest' | 'lowest_health' | 'highest_damage';
}

export class AutoShoot extends Module {
  private config: AutoShootConfig = {
    enabled: true,
    range: 300,
    fireRate: 500,
    targetPriority: 'nearest'
  };

  private lastShotTime: number = 0;
  private currentTarget: any = null;

  constructor() {
    super('Auto Shoot', 'Automatically shoot at nearby enemies', ModuleCategory.COMBAT);
    this.setKeybind('KeyA');
  }

  protected onEnable(): void {
    this.lastShotTime = Date.now();
    console.log('%c[AUTO SHOOT] Enabled', 'color: #00ff00;');
  }

  protected onDisable(): void {
    this.currentTarget = null;
    console.log('%c[AUTO SHOOT] Disabled', 'color: #ff0000;');
  }

  protected onUpdate(): void {
    if (!this.enabled) return;

    const now = Date.now();
    if (now - this.lastShotTime < this.config.fireRate) {
      return;
    }

    this.currentTarget = this.findTarget();
    if (this.currentTarget) {
      this.shoot(this.currentTarget);
      this.lastShotTime = now;
    }
  }

  /**
   * Find best target based on priority
   */
  private findTarget(): any {
    const enemies = this.getEnemies();
    const playerPos = this.getPlayerPosition();

    if (!playerPos) return null;

    let validEnemies = enemies.filter((enemy: any) => {
      const dx = enemy.x - playerPos.x;
      const dy = enemy.y - playerPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < this.config.range && enemy.health > 0;
    });

    if (validEnemies.length === 0) return null;

    switch (this.config.targetPriority) {
      case 'nearest':
        return this.findNearest(validEnemies, playerPos);
      case 'lowest_health':
        return validEnemies.reduce((min: any, enemy: any) =>
          (enemy.health < min.health) ? enemy : min
        );
      case 'highest_damage':
        return validEnemies.reduce((max: any, enemy: any) =>
          (enemy.damage > max.damage) ? enemy : max
        );
      default:
        return validEnemies[0];
    }
  }

  /**
   * Find nearest enemy
   */
  private findNearest(enemies: any[], playerPos: any): any {
    return enemies.reduce((nearest: any, enemy: any) => {
      const dx1 = nearest.x - playerPos.x;
      const dy1 = nearest.y - playerPos.y;
      const dx2 = enemy.x - playerPos.x;
      const dy2 = enemy.y - playerPos.y;
      const dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
      const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
      return dist2 < dist1 ? enemy : nearest;
    });
  }

  /**
   * Shoot at target
   */
  private shoot(target: any): void {
    if ((window as any).shootAtPosition) {
      (window as any).shootAtPosition(target.x, target.y);
    }
  }

  /**
   * Get enemies
   */
  private getEnemies(): any[] {
    return (window as any).gameEnemies || [];
  }

  /**
   * Get player position
   */
  private getPlayerPosition(): any {
    return (window as any).gamePlayerPosition || null;
  }

  public getConfig(): AutoShootConfig {
    return this.config;
  }

  public setConfig(config: Partial<AutoShootConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
