import {title} from 'node:process'

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
  type: "baseKey" | `connector` | `modifierKey`
  value: string
  title: string
}

const collator = new Intl.Collator(`de`)

// Useful: https://kbdlayout.info/KBDGR/virtualkeys
const titleMap: Record<string, string> = {
  escape: `ESC`,
  up: `▲`,
  down: `▼`,
  left: `◀`,
  right: `▶`,
  backspace: `⌫`,
  oem_1: `Ü`,
  oem_2: `#`,
  oem_3: `#`,
  oem_4: `ẞ`,
  oem_5: `^`,
  oem_6: `´`,
  oem_7: `Ä`,
  oem_period: `.`,
  oem_comma: `,`,
  oem_minus: `-`,
  oem_plus: `+`,
  oem_102: `<`,
}

const getTitleFromKey = (key: Keybinding['key']) => {
  if (titleMap[key]) {
    return titleMap[key]
  }
  if (key.startsWith(`numpad_`)) {
    return `Numpad ${key.slice(7)}`
  }
  return key.toUpperCase()
}

export class Keybinding {
  readonly key: string
  readonly command: string
  readonly args?: string[]
  readonly when?: string
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
    return this.toParts().map(part => {
      if (part === ` `) {
        return {
          type: `connector`,
          value: part,
          title: ` → `,
        }
      }
      if (part === `+`) {
        return {
          type: `connector`,
          value: part,
          title: ` `,
        }
      }
      if ([`ctrl`, `shift`, `alt`].includes(part)) {
        return {
          type: `modifierKey`,
          value: part,
          title: getTitleFromKey(part),
        }
      }
      return {
        type: `baseKey`,
        value: part,
        title: getTitleFromKey(part),
      }
    })
  }
  toParts() {
    return this.key.split(/([ +])/)
  }
  toKeys() {
    return this.key.split(/[ +]/) as [...string[], string]
  }
  toRaw() {
    const raw: RawKeybinding = {
      key: this.key,
      command: this.command,
    }
    if (this.args) {
      raw.args = this.args
    }
    if (this.when) {
      raw.when = this.when
    }
    return raw
  }
  isComplex() {
    return /[ +]/.test(this.key)
  }
  splitIntoHalves(): HalvesSplit {
    return /(?<prefix>.+[ +])?(?<baseKey>.+)$/.exec(this.key) as any as HalvesSplit
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
    console.dir({
      thisBaseKey,
      otherBaseKey,
    })
    return collator.compare(thisBaseKey, otherBaseKey)
    if (thisBaseKey !== otherBaseKey) {
      return collator.compare(thisBaseKey, otherBaseKey)
    }
    const thisComplexity = this.getComplexity()
    const otherComplexity = other.getComplexity()
    if (thisComplexity !== otherComplexity) {
      return thisComplexity - otherComplexity
    }
    if (this.command !== other.command) {
      return collator.compare(this.command, other.command)
    }
    return collator.compare(this.when ?? ``, other.when ?? ``)
  }
}
