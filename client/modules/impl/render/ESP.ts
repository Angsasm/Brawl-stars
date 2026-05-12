/**
 * ESP Module - Entity highlighting and information display
 */

import { Module, ModuleCategory } from '../../Module';

interface ESPConfig {
  enabled: boolean;
  showEnemies: boolean;
  showAllies: boolean;
  showBots: boolean;
  showNames: boolean;
  showHealth: boolean;
  showDistance: boolean;
}

export class ESP extends Module {
  private config: ESPConfig = {
    enabled: true,
    showEnemies: true,
    showAllies: true,
    showBots: false,
    showNames: true,
    showHealth: true,
    showDistance: true
  };

  private overlayCanvas: HTMLCanvasElement | null = null;
  private overlayCtx: CanvasRenderingContext2D | null = null;

  constructor() {
    super('ESP', 'Entity highlighting and information display', ModuleCategory.RENDER);
    this.setKeybind('KeyE');
    this.setupOverlay();
  }

  /**
   * Setup ESP overlay canvas
   */
  private setupOverlay(): void {
    if (this.overlayCanvas) return;

    this.overlayCanvas = document.createElement('canvas');
    this.overlayCanvas.id = 'esp-overlay-canvas';
    this.overlayCanvas.style.position = 'fixed';
    this.overlayCanvas.style.top = '0';
    this.overlayCanvas.style.left = '0';
    this.overlayCanvas.style.zIndex = '9999';
    this.overlayCanvas.style.pointerEvents = 'none';
    this.overlayCanvas.width = window.innerWidth;
    this.overlayCanvas.height = window.innerHeight;

    document.body.appendChild(this.overlayCanvas);
    this.overlayCtx = this.overlayCanvas.getContext('2d');

    // Update canvas size on window resize
    window.addEventListener('resize', () => {
      if (this.overlayCanvas) {
        this.overlayCanvas.width = window.innerWidth;
        this.overlayCanvas.height = window.innerHeight;
      }
    });
  }

  protected onEnable(): void {
    if (this.overlayCanvas) {
      this.overlayCanvas.style.display = 'block';
    }
    console.log('%c[ESP] Enabled', 'color: #00ff00;');
  }

  protected onDisable(): void {
    if (this.overlayCanvas) {
      this.overlayCanvas.style.display = 'none';
      if (this.overlayCtx) {
        this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
      }
    }
    console.log('%c[ESP] Disabled', 'color: #ff0000;');
  }

  protected onUpdate(): void {
    if (!this.overlayCtx || !this.overlayCanvas) return;

    // Clear canvas
    this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);

    const enemies = this.getEnemies();
    const allies = this.getAllies();

    if (this.config.showEnemies) {
      enemies.forEach((enemy: any) => this.renderEntity(enemy, '#ff0000'));
    }

    if (this.config.showAllies) {
      allies.forEach((ally: any) => this.renderEntity(ally, '#00ff00'));
    }
  }

  /**
   * Render entity on overlay
   */
  private renderEntity(entity: any, color: string): void {
    if (!this.overlayCtx) return;

    const screenPos = this.worldToScreen(entity.x, entity.y);
    if (!screenPos) return;

    const x = screenPos.x;
    const y = screenPos.y;

    // Draw box
    const boxSize = 40;
    this.overlayCtx.strokeStyle = color;
    this.overlayCtx.lineWidth = 2;
    this.overlayCtx.strokeRect(x - boxSize / 2, y - boxSize / 2, boxSize, boxSize);

    // Draw name
    if (this.config.showNames && entity.name) {
      this.overlayCtx.fillStyle = color;
      this.overlayCtx.font = 'bold 12px Arial';
      this.overlayCtx.fillText(entity.name, x - 20, y - 30);
    }

    // Draw health bar
    if (this.config.showHealth && entity.health) {
      const maxHealth = entity.maxHealth || 100;
      const healthPercent = entity.health / maxHealth;
      const barWidth = 40;
      const barHeight = 5;

      this.overlayCtx.fillStyle = '#333';
      this.overlayCtx.fillRect(x - barWidth / 2, y + 25, barWidth, barHeight);

      this.overlayCtx.fillStyle = healthPercent > 0.5 ? '#00ff00' : '#ff0000';
      this.overlayCtx.fillRect(x - barWidth / 2, y + 25, barWidth * healthPercent, barHeight);
    }

    // Draw distance
    if (this.config.showDistance && entity.distance) {
      this.overlayCtx.fillStyle = color;
      this.overlayCtx.font = '10px Arial';
      this.overlayCtx.fillText(`${Math.round(entity.distance)}m`, x - 15, y + 45);
    }
  }

  /**
   * Convert world coordinates to screen coordinates
   */
  private worldToScreen(worldX: number, worldY: number): { x: number; y: number } | null {
    // This should hook into the game's camera system
    const gameData = (window as any).gameCamera;
    if (!gameData) return null;

    const screenX = (worldX - gameData.x) * gameData.zoom + window.innerWidth / 2;
    const screenY = (worldY - gameData.y) * gameData.zoom + window.innerHeight / 2;

    return { x: screenX, y: screenY };
  }

  /**
   * Get visible enemies
   */
  private getEnemies(): any[] {
    return (window as any).gameEnemies || [];
  }

  /**
   * Get visible allies
   */
  private getAllies(): any[] {
    return (window as any).gameAllies || [];
  }

  public getConfig(): ESPConfig {
    return this.config;
  }

  public setConfig(config: Partial<ESPConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
