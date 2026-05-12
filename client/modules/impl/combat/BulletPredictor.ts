/**
 * Bullet Predictor Module - Predict enemy bullet trajectories
 */

import { Module, ModuleCategory } from '../../Module';

export class BulletPredictor extends Module {
  private predictorCanvas: HTMLCanvasElement | null = null;
  private predictorCtx: CanvasRenderingContext2D | null = null;

  constructor() {
    super('Bullet Predictor', 'Predict and display incoming bullet trajectories', ModuleCategory.COMBAT);
    this.setKeybind('KeyP');
    this.setupOverlay();
  }

  /**
   * Setup prediction overlay
   */
  private setupOverlay(): void {
    if (this.predictorCanvas) return;

    this.predictorCanvas = document.createElement('canvas');
    this.predictorCanvas.id = 'bullet-predictor-canvas';
    this.predictorCanvas.style.position = 'fixed';
    this.predictorCanvas.style.top = '0';
    this.predictorCanvas.style.left = '0';
    this.predictorCanvas.style.zIndex = '9997';
    this.predictorCanvas.style.pointerEvents = 'none';
    this.predictorCanvas.width = window.innerWidth;
    this.predictorCanvas.height = window.innerHeight;

    document.body.appendChild(this.predictorCanvas);
    this.predictorCtx = this.predictorCanvas.getContext('2d');
  }

  protected onEnable(): void {
    if (this.predictorCanvas) {
      this.predictorCanvas.style.display = 'block';
    }
    console.log('%c[BULLET PREDICTOR] Enabled', 'color: #00ff00;');
  }

  protected onDisable(): void {
    if (this.predictorCanvas) {
      this.predictorCanvas.style.display = 'none';
      if (this.predictorCtx) {
        this.predictorCtx.clearRect(0, 0, this.predictorCanvas.width, this.predictorCanvas.height);
      }
    }
    console.log('%c[BULLET PREDICTOR] Disabled', 'color: #ff0000;');
  }

  protected onUpdate(): void {
    if (!this.predictorCtx || !this.predictorCanvas) return;

    this.predictorCtx.clearRect(0, 0, this.predictorCanvas.width, this.predictorCanvas.height);

    const bullets = this.getIncomingBullets();
    const playerPos = this.getPlayerPosition();

    if (playerPos) {
      bullets.forEach((bullet: any) => {
        this.drawBulletPrediction(bullet, playerPos);
      });

      // Draw safe zones
      this.drawSafeZones(bullets, playerPos);
    }
  }

  /**
   * Draw bullet trajectory prediction
   */
  private drawBulletPrediction(bullet: any, playerPos: any): void {
    if (!this.predictorCtx) return;

    const trajectory = this.calculateBulletTrajectory(bullet);

    // Draw trajectory line
    this.predictorCtx.strokeStyle = 'rgba(255, 100, 0, 0.8)';
    this.predictorCtx.lineWidth = 2;
    this.predictorCtx.setLineDash([3, 3]);
    this.predictorCtx.beginPath();

    if (trajectory.length > 0) {
      const start = this.worldToScreen(trajectory[0].x, trajectory[0].y);
      if (start) {
        this.predictorCtx.moveTo(start.x, start.y);

        for (let i = 1; i < trajectory.length; i++) {
          const point = this.worldToScreen(trajectory[i].x, trajectory[i].y);
          if (point) {
            this.predictorCtx.lineTo(point.x, point.y);
          }
        }
      }
    }

    this.predictorCtx.stroke();
    this.predictorCtx.setLineDash([]);

    // Draw bullet position
    const bulletScreen = this.worldToScreen(bullet.x, bullet.y);
    if (bulletScreen) {
      this.predictorCtx.fillStyle = '#ff6400';
      this.predictorCtx.beginPath();
      this.predictorCtx.arc(bulletScreen.x, bulletScreen.y, 5, 0, Math.PI * 2);
      this.predictorCtx.fill();
    }
  }

  /**
   * Draw safe zones
   */
  private drawSafeZones(bullets: any[], playerPos: any): void {
    if (!this.predictorCtx) return;

    const dangerRadius = 100;
    const playerScreen = this.worldToScreen(playerPos.x, playerPos.y);

    if (!playerScreen) return;

    // Draw danger zone circles for each bullet
    bullets.forEach((bullet: any) => {
      this.predictorCtx!.strokeStyle = 'rgba(255, 0, 0, 0.3)';
      this.predictorCtx!.lineWidth = 1;
      this.predictorCtx!.beginPath();
      this.predictorCtx!.arc(playerScreen.x, playerScreen.y, dangerRadius, 0, Math.PI * 2);
      this.predictorCtx!.stroke();
    });
  }

  /**
   * Calculate bullet trajectory
   */
  private calculateBulletTrajectory(bullet: any): any[] {
    const trajectory = [];
    const steps = 30;
    const gravity = 0.3;

    let x = bullet.x;
    let y = bullet.y;
    let vx = bullet.velocityX || 0;
    let vy = bullet.velocityY || 0;

    for (let i = 0; i < steps; i++) {
      trajectory.push({ x, y });
      vx *= 0.96; // Air resistance
      vy += gravity;
      x += vx;
      y += vy;
    }

    return trajectory;
  }

  /**
   * Get incoming bullets
   */
  private getIncomingBullets(): any[] {
    return (window as any).gameIncomingBullets || [];
  }

  /**
   * Get player position
   */
  private getPlayerPosition(): any {
    return (window as any).gamePlayerPosition || null;
  }

  /**
   * Convert world to screen coordinates
   */
  private worldToScreen(worldX: number, worldY: number): { x: number; y: number } | null {
    const gameData = (window as any).gameCamera;
    if (!gameData) return null;

    const screenX = (worldX - gameData.x) * gameData.zoom + window.innerWidth / 2;
    const screenY = (worldY - gameData.y) * gameData.zoom + window.innerHeight / 2;

    return { x: screenX, y: screenY };
  }
}
