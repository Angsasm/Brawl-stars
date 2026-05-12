/**
 * FPS Counter Module - Displays real-time FPS
 */

import { Module, ModuleCategory } from '../../Module';

export class FPSCounter extends Module {
  private frameCount: number = 0;
  private lastTime: number = Date.now();
  private currentFPS: number = 0;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor() {
    super('FPS Counter', 'Display real-time FPS counter', ModuleCategory.RENDER);
    this.setupCanvas();
  }

  /**
   * Setup overlay canvas for FPS display
   */
  private setupCanvas(): void {
    if (this.canvas) return;

    this.canvas = document.createElement('canvas');
    this.canvas.id = 'fps-counter-canvas';
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '10px';
    this.canvas.style.left = '10px';
    this.canvas.style.zIndex = '10001';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.width = 150;
    this.canvas.height = 50;

    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
  }

  protected onEnable(): void {
    if (this.canvas) {
      this.canvas.style.display = 'block';
    }
    console.log('%c[FPS COUNTER] Enabled', 'color: #00ff00;');
  }

  protected onDisable(): void {
    if (this.canvas) {
      this.canvas.style.display = 'none';
    }
    console.log('%c[FPS COUNTER] Disabled', 'color: #ff0000;');
  }

  protected onUpdate(): void {
    this.frameCount++;
    const now = Date.now();
    const elapsed = now - this.lastTime;

    if (elapsed >= 1000) {
      this.currentFPS = Math.round((this.frameCount * 1000) / elapsed);
      this.frameCount = 0;
      this.lastTime = now;
    }

    this.render();
  }

  /**
   * Render FPS to canvas
   */
  private render(): void {
    if (!this.ctx || !this.canvas) return;

    // Clear canvas
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw border
    this.ctx.strokeStyle = '#00ff00';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw FPS text
    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.fillText(`FPS: ${this.currentFPS}`, 10, 30);
  }
}
