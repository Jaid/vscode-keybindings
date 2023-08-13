export interface RawKeybinding {
  key: string
  command: string
  args?: string[]
  when?: string
}

export default class Keybinding {
  key: string
  command: any
  args: any
  constructor(public data: RawKeybinding) {
    this.key = data.key
    this.command = data.command
    this.args = data.args
  }
}