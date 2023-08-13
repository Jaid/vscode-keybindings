export interface RawKeybinding {
  key: string;
  command: string;
  args?: string[];
  when?: string;
}

export default class Keybinding {
  readonly key: string
  readonly command: any
  readonly args?: any
  readonly when?: string
  constructor(public data: RawKeybinding) {
    Object.assign(this, data)
  }
  isAddition() {
    return !this.key.startsWith(`-`)
  }
}
