/**
 * Brawl Ball Helper - Check if aim reaches goal
 */

import { Module, ModuleCategory } from '../../Module';

export class BrawlBallHelper extends Module {
  private ballOverlayCanvas: HTMLCanvasElement | null = null;
  private ballOverlayCtx: CanvasRenderingContext2D | null = null;
  private isAimValid: boolean = false;

  constructor() {
    super('Brawl Ball Helper', 'Check if your aim reaches the goal', ModuleCategory.COMBAT);
    this.setKeybind('KeyB');
    this.setupOverlay();
  }

  /**
   * Setup overlay for ball trajectory visualization
   */
  private setupOverlay(): void {
    if (this.ballOverlayCanvas) return;

    this.ballOverlayCanvas = document.createElement('canvas');
    this.ballOverlayCanvas.id = 'brawl-ball-overlay';
    this.ballOverlayCanvas.style.position = 'fixed';
    this.ballOverlayCanvas.style.top = '0';
    this.ballOverlayCanvas.style.left = '0';
    this.ballOverlayCanvas.style.zIndex = '9998';
    this.ballOverlayCanvas.style.pointerEvents = 'none';
    this.ballOverlayCanvas.width = window.innerWidth;
    this.ballOverlayCanvas.height = window.innerHeight;

    document.body.appendChild(this.ballOverlayCanvas);
    this.ballOverlayCtx = this.ballOverlayCanvas.getContext('2d');
  }

  protected onEnable(): void {
    if (this.ballOverlayCanvas) {
      this.ballOverlayCanvas.style.display = 'block';
    }
    console.log('%c[BRAWL BALL HELPER] Enabled', 'color: #00ff00;');
  }

  protected onDisable(): void {
    if (this.ballOverlayCanvas) {
      this.ballOverlayCanvas.style.display = 'none';
      if (this.ballOverlayCtx) {
        this.ballOverlayCtx.clearRect(0, 0, this.ballOverlayCanvas.width, this.ballOverlayCanvas.height);
      }
    }
    console.log('%c[BRAWL BALL HELPER] Disabled', 'color: #ff0000;');
  }

  protected onUpdate(): void {
    if (!this.ballOverlayCtx || !this.ballOverlayCanvas) return;

    this.ballOverlayCtx.clearRect(0, 0, this.ballOverlayCanvas.width, this.ballOverlayCanvas.height);

    const ballPos = this.getBallPosition();
    const playerPos = this.getPlayerPosition();
    const goalPos = this.getGoalPosition();
    const aimAngle = this.getPlayerAimAngle();

    if (ballPos && playerPos && goalPos && aimAngle !== null) {
      this.drawTrajectory(ballPos, playerPos, aimAngle, goalPos);
    }
  }

  /**
   * Draw ball trajectory and goal indicator
   */
  private drawTrajectory(ballPos: any, playerPos: any, aimAngle: number, goalPos: any): void {
    if (!this.ballOverlayCtx) return;

    // Calculate trajectory
    const power = 20; // Default ball throw power
    const trajectory = this.calculateTrajectory(ballPos, aimAngle, power);

    // Check if trajectory hits goal
    this.isAimValid = this.checkGoalIntersection(trajectory, goalPos);

    // Draw trajectory line
    this.ballOverlayCtx.strokeStyle = this.isAimValid ? '#00ff00' : '#ff0000';
    this.ballOverlayCtx.lineWidth = 3;
    this.ballOverlayCtx.setLineDash([5, 5]);
    this.ballOverlayCtx.beginPath();

    if (trajectory.length > 0) {
      const start = this.worldToScreen(trajectory[0].x, trajectory[0].y);
      if (start) {
        this.ballOverlayCtx.moveTo(start.x, start.y);

        for (let i = 1; i < trajectory.length; i++) {
          const point = this.worldToScreen(trajectory[i].x, trajectory[i].y);
          if (point) {
            this.ballOverlayCtx.lineTo(point.x, point.y);
          }
        }
      }
    }

    this.ballOverlayCtx.stroke();
    this.ballOverlayCtx.setLineDash([]);

    // Draw goal indicator
    if (goalPos) {
      const screenGoal = this.worldToScreen(goalPos.x, goalPos.y);
      if (screenGoal) {
        this.ballOverlayCtx.fillStyle = this.isAimValid ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.1)';
        this.ballOverlayCtx.beginPath();
        this.ballOverlayCtx.arc(screenGoal.x, screenGoal.y, 30, 0, Math.PI * 2);
        this.ballOverlayCtx.fill();

        // Draw text indicator
        this.ballOverlayCtx.fillStyle = this.isAimValid ? '#00ff00' : '#ff0000';
        this.ballOverlayCtx.font = 'bold 14px Arial';
        this.ballOverlayCtx.fillText(this.isAimValid ? 'GOAL!' : 'Miss', screenGoal.x - 25, screenGoal.y);
      }
    }
  }

  /**
   * Calculate ball trajectory
   */
  private calculateTrajectory(ballPos: any, angle: number, power: number): any[] {
    const trajectory = [];
    const steps = 50;
    const gravity = 0.5;

    let x = ballPos.x;
    let y = ballPos.y;
    let vx = Math.cos(angle) * power;
    let vy = Math.sin(angle) * power;

    for (let i = 0; i < steps; i++) {
      trajectory.push({ x, y });
      vx *= 0.98; // Air resistance
      vy += gravity;
      x += vx;
      y += vy;
    }

    return trajectory;
  }

  /**
   * Check if trajectory intersects with goal
   */
  private checkGoalIntersection(trajectory: any[], goalPos: any): boolean {
    const goalRadius = 50;

    for (const point of trajectory) {
      const dx = point.x - goalPos.x;
      const dy = point.y - goalPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < goalRadius) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get ball position
   */
  private getBallPosition(): any {
    return (window as any).gameBallPosition || { x: 0, y: 0 };
  }

  /**
   * Get player position
   */
  private getPlayerPosition(): any {
    return (window as any).gamePlayerPosition || { x: 0, y: 0 };
  }

  /**
   * Get goal position
   */
  private getGoalPosition(): any {
    return (window as any).gameGoalPosition || null;
  }

  /**
   * Get player aim angle
   */
  private getPlayerAimAngle(): number | null {
    return (window as any).gameAimAngle || null;
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

  public isGoalValid(): boolean {
    return this.isAimValid;
  }
}
