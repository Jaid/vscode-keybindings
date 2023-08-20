import {TypedArray} from 'type-fest'

export type RawKeybinding = {
  key: string
  command: string
  args?: string[]
  when?: string
}

export type HalvesSplit = {
  prefix?: string
  baseKey: string
}

export type KeyVisualization = {

}

export class Keybinding {
  readonly key: string
  readonly command: any
  readonly args?: any
  readonly when?: string
  static compare(a: Keybinding, b: Keybinding) {
    return a.compareTo(b)
  }
  static fromRaw(raw: RawKeybinding) {
    return new Keybinding(raw)
  }
  constructor(public data: RawKeybinding) {
    Object.assign(this, data)
  }
  isAddition() {
    return !this.key.startsWith(`-`)
  }
  asVisualization(): KeyVisualization[] {
    const keyVisualization = this.toParts().map(part => {
      if (part === ` `) {
        return {
          type: `connector`,
          value: ` → `,
        }
      }
      if (part === `+`) {
        return {
          type: `connector`,
          value: ` `,
        }
      }
      return {
        type: `key`,
        value: part,
      }
    })
    keyVisualization
  }
  toParts() {
    return this.key.split(/([ +])/)
  }
  toKeys() {
    return this.key.split(/[ +]/) as [...string[], string]
  }
  isComplex() {
    return /[ +]/.test(this.key)
  }
  splitIntoHalves(): HalvesSplit {
    return /(?<prefix>.*[ +])?(?<baseKey>.+)$/.exec(this.key) as any as HalvesSplit
  }
  getBaseKey() {
    return this.splitIntoHalves().baseKey
  }
  getPrefix(): string | null {
    return this.splitIntoHalves().prefix ?? null
  }
  getLogic() {
    if (this.command.startsWith(`-`)) {
      return `deletion`
    }
    return `addition`
  }
  getComplexity() {
    const keys = this.toKeys()
    if (keys.length === 1) {
      return 0
    }
    const modifiers = keys.slice(0, -1)
    return modifiers.length * 10 + modifiers.join(``).length
  }
  compareTo(other: Keybinding) {
    const thisBaseKey = this.getBaseKey()
    const otherBaseKey = other.getBaseKey()
    if (thisBaseKey !== otherBaseKey) {
      return Intl.Collator().compare(thisBaseKey, otherBaseKey)
    }
  }
}
