/**
 * Base Module Class
 * All features extend this class
 */

export enum ModuleCategory {
  COMBAT = 'Combat',
  RENDER = 'Render',
  MOVEMENT = 'Movement',
  MISC = 'Misc'
}

export abstract class Module {
  protected name: string;
  protected description: string;
  protected category: ModuleCategory;
  protected enabled: boolean = false;
  protected keybind: string | null = null;

  constructor(name: string, description: string, category: ModuleCategory) {
    this.name = name;
    this.description = description;
    this.category = category;
  }

  /**
   * Enable the module
   */
  public enable(): void {
    if (!this.enabled) {
      this.enabled = true;
      this.onEnable();
    }
  }

  /**
   * Disable the module
   */
  public disable(): void {
    if (this.enabled) {
      this.enabled = false;
      this.onDisable();
    }
  }

  /**
   * Toggle module state
   */
  public toggle(): void {
    if (this.enabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  /**
   * Update module (called every frame)
   */
  public update(): void {
    if (this.enabled) {
      this.onUpdate();
    }
  }

  /**
   * Set keybind
   */
  public setKeybind(key: string): void {
    this.keybind = key;
  }

  /**
   * Handle key press
   */
  public onKeyPress(code: string): void {
    if (this.keybind && code === this.keybind) {
      this.toggle();
    }
  }

  /**
   * Get module info
   */
  public getInfo() {
    return {
      name: this.name,
      description: this.description,
      category: this.category,
      enabled: this.enabled,
      keybind: this.keybind
    };
  }

  // Abstract methods to be implemented by subclasses
  protected abstract onEnable(): void;
  protected abstract onDisable(): void;
  protected abstract onUpdate(): void;

  // Getters
  public getName(): string { return this.name; }
  public getDescription(): string { return this.description; }
  public getCategory(): ModuleCategory { return this.category; }
  public isEnabled(): boolean { return this.enabled; }
  public getKeybind(): string | null { return this.keybind; }
}
