/**
 * Wall Hack Module - See through walls
 */

import { Module, ModuleCategory } from '../../Module';

interface WallHackConfig {
  enabled: boolean;
  opacity: number; // 0.0 - 1.0
}

export class WallHack extends Module {
  private config: WallHackConfig = {
    enabled: true,
    opacity: 0.3
  };

  private originalStyles: Map<HTMLElement, string> = new Map();

  constructor() {
    super('Wall Hack', 'See through walls and obstacles', ModuleCategory.RENDER);
    this.setKeybind('KeyW');
  }

  protected onEnable(): void {
    this.applyWallHack();
    console.log('%c[WALL HACK] Enabled', 'color: #00ff00;');
  }

  protected onDisable(): void {
    this.removeWallHack();
    console.log('%c[WALL HACK] Disabled', 'color: #ff0000;');
  }

  protected onUpdate(): void {
    // Wall hack is maintained through CSS modifications
  }

  /**
   * Apply wall hack by making obstacles transparent
   */
  private applyWallHack(): void {
    const obstacles = this.getWallElements();

    obstacles.forEach((element: HTMLElement) => {
      // Store original style
      if (!this.originalStyles.has(element)) {
        this.originalStyles.set(element, element.getAttribute('style') || '');
      }

      // Apply transparency
      element.style.opacity = this.config.opacity.toString();
      element.style.pointerEvents = 'none';
    });

    // Hook into game render to maintain effect
    if ((window as any).hookRender) {
      (window as any).hookRender(() => {
        this.maintainWallHack();
      });
    }
  }

  /**
   * Maintain wall hack effect during gameplay
   */
  private maintainWallHack(): void {
    const obstacles = this.getWallElements();
    obstacles.forEach((element: HTMLElement) => {
      element.style.opacity = this.config.opacity.toString();
    });
  }

  /**
   * Remove wall hack
   */
  private removeWallHack(): void {
    this.originalStyles.forEach((originalStyle, element) => {
      if (originalStyle) {
        element.setAttribute('style', originalStyle);
      } else {
        element.removeAttribute('style');
      }
    });
    this.originalStyles.clear();
  }

  /**
   * Get wall/obstacle elements
   */
  private getWallElements(): HTMLElement[] {
    const gameContainer = document.querySelector('[data-game-walls]');
    if (!gameContainer) return [];

    return Array.from(gameContainer.querySelectorAll('[data-obstacle], .wall, .obstacle'));
  }

  /**
   * Set wall opacity
   */
  public setOpacity(opacity: number): void {
    this.config.opacity = Math.max(0.0, Math.min(1.0, opacity));
    if (this.enabled) {
      this.maintainWallHack();
    }
  }

  public getConfig(): WallHackConfig {
    return this.config;
  }
}
