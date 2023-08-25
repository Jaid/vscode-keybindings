import path from 'node:path'

import KeyCounter from 'key-counter'
import readFileJson from 'read-file-json'
import yaml from 'yaml'

import {RawKeybinding, sortRaw} from 'lib/Keybinding.js'

const toYaml = input => yaml.stringify(input, null, {
  schema: `core`,
  lineWidth: 0,
  minContentWidth: 0,
  singleQuote: true,
  nullStr: `~`,
})

const ExclusionRule = class {
  value: string

  type: `command` | `regex` | `static`

  constructor(input) {
    if (typeof input === `string`) {
      this.value = input
      this.type = `static`
    }
    if (input instanceof RegExp) {
      this.value = input
      this.type = `regex`
    }
    if (Array.isArray(input)) {
      if (input[0] === `command`) {
        this.value = input[1]
        this.type = `command`
      }
    }
  }

  test(keystrokeObject) {
    if (this.type === `static`) {
      return keystrokeObject.key === this.value
    }
    if (this.type === `regex`) {
      return this.value.test(keystrokeObject.key)
    }
    if (this.type === `command`) {
      return keystrokeObject.command === this.value
    }
  }

  getTitle() {
    if (this.type === `static`) {
      return this.value
    }
    if (this.type === `regex`) {
      return this.value.source
    }
    if (this.type === `command`) {
      return `command ${this.value}`
    }
  }
}
const excludedKeystrokes = [
  /^(|(ctrl|alt|shift|ctrl\+alt|shift\+alt|ctrl\+shift|ctrl\+shift\+alt)\+)(down|up)$/,
  /^(|(ctrl|alt|shift|shift\+alt|ctrl\+shift)\+)(left|right)$/,
  /^(|(ctrl|alt|shift|ctrl\+alt|shift\+alt|ctrl\+shift|ctrl\+shift\+alt)\+)(pagedown|pageup)$/,
  /^(|(ctrl|alt|shift|ctrl\+alt|shift\+alt|ctrl\+shift|ctrl\+shift\+alt)\+)(end|home)$/,
  /^(|(ctrl|alt|ctrl\+alt|shift\+alt|ctrl\+shift|ctrl\+shift\+alt)\+)backspace$/,
  /^(|(ctrl|alt|ctrl\+alt|shift\+alt|ctrl\+shift|ctrl\+shift\+alt)\+)delete$/,
  /^(|(ctrl|alt|shift|ctrl\+alt|shift\+alt|ctrl\+shift|ctrl\+shift\+alt)\+)tab$/,
  /^(|(ctrl|alt|shift|ctrl\+alt|shift\+alt|ctrl\+shift|ctrl\+shift\+alt)\+)enter$/,
  /^(|(ctrl|alt|shift|ctrl\+alt|shift\+alt|ctrl\+shift|ctrl\+shift\+alt)\+)escape$/,
  /^(|(ctrl|alt|shift|ctrl\+alt|shift\+alt|ctrl\+shift|ctrl\+shift\+alt)\+)space$/,
  `ctrl+a`,
  `ctrl+c`,
  `ctrl+v`,
  `ctrl+z`,
  `ctrl+f`,
  `ctrl+shift+z`,
  `ctrl+shift+f`,
  `ctrl+w`,
  `ctrl+x`,
  [`command`, `editor.action.refactor`],
].map(input => new ExclusionRule(input))
const jsonPath = path.join(`src`, `global.jsonc`)
const data = await readFileJson.default(jsonPath)
export default () => {
  const result: RawKeybinding[] = []
  const excluded: RawKeybinding[] = []
  const exclusionCounter = new KeyCounter.default
  const keystrokeCounter = new KeyCounter.default
  for (const entry of data) {
    let isIncluded = true
    for (const excludedKeystroke of excludedKeystrokes) {
      if (excludedKeystroke.test(entry)) {
        isIncluded = false
        excluded.push(entry)
        exclusionCounter.feed(excludedKeystroke.getTitle())
        break
      }
    }
    if (!isIncluded) {
      continue
    }
    result.push({
      ...entry,
      command: `-${entry.command}`,
    })
  }
  result.sort(sortRaw)
  excluded.sort(sortRaw)
  console.info(`Loaded ${Object.keys(data).length} global keybindings from ${jsonPath}`)
  console.info(`Included ${result.length}, excluded ${data.length - result.length}`)
  console.group(`YAML output (keystrokes to delete)`)
  console.info(toYaml(result))
  console.groupEnd()
  console.group(`Excluded (keystrokes to keep)`)
  console.info(`Excluded ${excluded.length} keybindings`)
  console.info(toYaml(exclusionCounter.toObjectSortedByValues()))
  console.info(toYaml(excluded))
  console.groupEnd()
  const keystrokeList = Object.entries(keystrokeCounter.toObjectSortedByValues()).map(([key, value]) => {
    return {
      key,
      value,
      keystrokes: data.filter(entry => entry.key === key),
    }
  })
  keystrokeList.reverse()
  for (const entry of keystrokeList) {
    console.group(`Keystroke ${entry.key} (${entry.value})`)
    console.info(entry)
    console.groupEnd()
  }
  return {
    result,
    excluded,
  }
}
