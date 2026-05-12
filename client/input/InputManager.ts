/**
 * Input Manager - Handles all user input
 */

export class InputManager {
  private keyStates: Map<string, boolean> = new Map();
  private mousePosition: { x: number; y: number } = { x: 0, y: 0 };

  constructor() {
    this.setupListeners();
  }

  /**
   * Setup input listeners
   */
  private setupListeners(): void {
    document.addEventListener('keydown', (e) => this.keyStates.set(e.code, true));
    document.addEventListener('keyup', (e) => this.keyStates.set(e.code, false));
    document.addEventListener('mousemove', (e) => {
      this.mousePosition.x = e.clientX;
      this.mousePosition.y = e.clientY;
      (window as any).mousePosition = this.mousePosition;
    });

    // Prevent context menu for right click
    document.addEventListener('contextmenu', (e) => {
      if ((window as any).brawlClientActive) {
        e.preventDefault();
      }
    });
  }

  /**
   * Check if key is pressed
   */
  public isKeyPressed(code: string): boolean {
    return this.keyStates.get(code) || false;
  }

  /**
   * Get mouse position
   */
  public getMousePosition(): { x: number; y: number } {
    return { ...this.mousePosition };
  }
}
