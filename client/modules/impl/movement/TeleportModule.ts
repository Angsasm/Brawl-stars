/**
 * Teleport Module - Quick teleportation ability
 */

import { Module, ModuleCategory } from '../../Module';

export class TeleportModule extends Module {
  private teleportRange: number = 200;
  private cooldown: number = 1000; // milliseconds
  private lastTeleportTime: number = 0;
  private teleportCanvas: HTMLCanvasElement | null = null;
  private teleportCtx: CanvasRenderingContext2D | null = null;

  constructor() {
    super('Teleport', 'Quick teleportation ability', ModuleCategory.MOVEMENT);
    this.setKeybind('KeyT');
    this.setupOverlay();
  }

  /**
   * Setup teleport indicator overlay
   */
  private setupOverlay(): void {
    if (this.teleportCanvas) return;

    this.teleportCanvas = document.createElement('canvas');
    this.teleportCanvas.id = 'teleport-overlay';
    this.teleportCanvas.style.position = 'fixed';
    this.teleportCanvas.style.top = '0';
    this.teleportCanvas.style.left = '0';
    this.teleportCanvas.style.zIndex = '9996';
    this.teleportCanvas.style.pointerEvents = 'none';
    this.teleportCanvas.width = window.innerWidth;
    this.teleportCanvas.height = window.innerHeight;

    document.body.appendChild(this.teleportCanvas);
    this.teleportCtx = this.teleportCanvas.getContext('2d');
  }

  protected onEnable(): void {
    if (this.teleportCanvas) {
      this.teleportCanvas.style.display = 'block';
    }
    console.log('%c[TELEPORT] Enabled - Click to teleport to cursor', 'color: #00ff00;');
    this.setupTeleportListener();
  }

  protected onDisable(): void {
    if (this.teleportCanvas) {
      this.teleportCanvas.style.display = 'none';
    }
    console.log('%c[TELEPORT] Disabled', 'color: #ff0000;');
    this.removeTeleportListener();
  }

  protected onUpdate(): void {
    if (!this.teleportCtx || !this.teleportCanvas) return;

    this.teleportCtx.clearRect(0, 0, this.teleportCanvas.width, this.teleportCanvas.height);

    // Draw teleport range circle around cursor
    const mouse = (window as any).mousePosition || { x: 0, y: 0 };

    // Draw range circle
    this.teleportCtx.strokeStyle = 'rgba(0, 200, 255, 0.5)';
    this.teleportCtx.lineWidth = 2;
    this.teleportCtx.beginPath();
    this.teleportCtx.arc(mouse.x, mouse.y, this.teleportRange, 0, Math.PI * 2);
    this.teleportCtx.stroke();

    // Draw center point
    this.teleportCtx.fillStyle = '#00c8ff';
    this.teleportCtx.beginPath();
    this.teleportCtx.arc(mouse.x, mouse.y, 5, 0, Math.PI * 2);
    this.teleportCtx.fill();

    // Draw cooldown indicator if applicable
    const now = Date.now();
    const cooldownRemaining = Math.max(0, this.cooldown - (now - this.lastTeleportTime));
    if (cooldownRemaining > 0) {
      const cooldownPercent = cooldownRemaining / this.cooldown;
      this.teleportCtx.fillStyle = `rgba(255, 100, 0, ${cooldownPercent})`;
      this.teleportCtx.font = 'bold 14px Arial';
      this.teleportCtx.fillText(`CD: ${(cooldownRemaining / 1000).toFixed(1)}s`, mouse.x - 20, mouse.y - 40);
    }
  }

  /**
   * Setup click listener for teleportation
   */
  private setupTeleportListener(): void {
    document.addEventListener('mousedown', this.handleTeleportClick.bind(this));
  }

  /**
   * Remove click listener
   */
  private removeTeleportListener(): void {
    document.removeEventListener('mousedown', this.handleTeleportClick.bind(this));
  }

  /**
   * Handle teleport click
   */
  private handleTeleportClick(e: MouseEvent): void {
    if (!this.enabled) return;

    const now = Date.now();
    if (now - this.lastTeleportTime < this.cooldown) {
      return; // Still on cooldown
    }

    // Right click to teleport
    if (e.button === 2) {
      const playerPos = this.getPlayerPosition();
      if (!playerPos) return;

      const screenX = e.clientX;
      const screenY = e.clientY;

      // Convert screen to world coordinates
      const worldPos = this.screenToWorld(screenX, screenY);
      if (!worldPos) return;

      // Check if within range
      const dx = worldPos.x - playerPos.x;
      const dy = worldPos.y - playerPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= this.teleportRange) {
        this.executeTeleport(worldPos);
        this.lastTeleportTime = now;
      }
    }
  }

  /**
   * Execute teleportation
   */
  private executeTeleport(targetPos: any): void {
    if ((window as any).teleportPlayer) {
      (window as any).teleportPlayer(targetPos.x, targetPos.y);
      console.log('%c[TELEPORT] Teleported!', 'color: #00c8ff;');
    }
  }

  /**
   * Convert screen to world coordinates
   */
  private screenToWorld(screenX: number, screenY: number): { x: number; y: number } | null {
    const gameData = (window as any).gameCamera;
    if (!gameData) return null;

    const worldX = (screenX - window.innerWidth / 2) / gameData.zoom + gameData.x;
    const worldY = (screenY - window.innerHeight / 2) / gameData.zoom + gameData.y;

    return { x: worldX, y: worldY };
  }

  /**
   * Get player position
   */
  private getPlayerPosition(): any {
    return (window as any).gamePlayerPosition || null;
  }

  /**
   * Set teleport range
   */
  public setRange(range: number): void {
    this.teleportRange = Math.max(50, Math.min(500, range));
  }

  /**
   * Set cooldown
   */
  public setCooldown(cooldown: number): void {
    this.cooldown = Math.max(100, Math.min(5000, cooldown));
  }
}
