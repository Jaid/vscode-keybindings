// @ts-nocheck
import core from '@actions/core'
import fs from 'fs-extra'
import yaml from 'yaml'
import path from 'path'
import readFileJson from 'read-file-json'
import KeyCounter from 'key-counter'
const excludedKeystrokes = [
  /^(|(ctrl|alt|shift|ctrl\+alt|shift\+alt|ctrl\+shift|ctrl\+shift\+alt)\+)(up|left|right|down)$/,
  /^(|(ctrl|alt|shift|ctrl\+alt|shift\+alt|ctrl\+shift|ctrl\+shift\+alt)\+)(pageup|pagedown)$/,
  /^(|(ctrl|alt|shift|ctrl\+alt|shift\+alt|ctrl\+shift|ctrl\+shift\+alt)\+)(end|home)$/,
  /^(|(ctrl|alt|shift|ctrl\+alt|shift\+alt|ctrl\+shift|ctrl\+shift\+alt)\+)backspace$/,
  /^(|(ctrl|alt|shift|ctrl\+alt|shift\+alt|ctrl\+shift|ctrl\+shift\+alt)\+)delete$/,
  /^(|(ctrl|alt|shift|ctrl\+alt|shift\+alt|ctrl\+shift|ctrl\+shift\+alt)\+)tab$/,
  /^(|(ctrl|alt|shift|ctrl\+alt|shift\+alt|ctrl\+shift|ctrl\+shift\+alt)\+)enter$/,
  /^(|(ctrl|alt|shift|ctrl\+alt|shift\+alt|ctrl\+shift|ctrl\+shift\+alt)\+)escape$/,
  /^(|(ctrl|alt|shift|ctrl\+alt|shift\+alt|ctrl\+shift|ctrl\+shift\+alt)\+)space$/,
  'ctrl+a',
  'ctrl+c',
  'ctrl+v',
  'ctrl+z',
  'ctrl+f',
  'ctrl+shift+z',
  'ctrl+shift+f',
  'ctrl+w',
  'ctrl+x'
]
const github = JSON.parse(process.env.github)
const jsonPath = path.resolve(github.workspace, 'src', 'global.jsonc')
const data = await readFileJson.default(jsonPath)
const result = []
const excluded = []
const exclusionCounter = new KeyCounter.default
const keystrokeCounter = new KeyCounter.default
const toYaml = input => yaml.stringify(input, null, {
  schema: 'core',
  lineWidth: 0,
  minContentWidth: 0,
  singleQuote: true,
  nullStr: '~'
})
const shouldInclude = entry => {
  if (entry.command.startsWith('-')) {
    return false
  }
  for (const excludedKeystroke of excludedKeystrokes) {
    if (typeof excludedKeystroke === 'string') {
      if (entry.key === excludedKeystroke) {
        exclusionCounter.feed(excludedKeystroke)
        return false
      }
    }
    if (excludedKeystroke instanceof RegExp) {
      if (excludedKeystroke.test(entry.key)) {
        exclusionCounter.feed(excludedKeystroke.source)
        return false
      }
    }
  }
  keystrokeCounter.feed(entry.key)
  return true
}
for (const entry of data) {
  const include = shouldInclude(entry)
  if (include) {
    result.push({
      command: `-${entry.command}`,
      ...entry,
    })
  } else {
    excluded.push(entry)
  }
}
core.info(`Loaded ${Object.keys(data).length} global keybindings from ${jsonPath}`)
core.info(`Included ${result.length}, excluded ${data.length - result.length}`)
core.startGroup('YAML output')
core.info(toYaml(result))
core.endGroup()
core.startGroup('Excluded')
core.info(`Excluded ${excluded.length} keybindings`)
core.info(toYaml(exclusionCounter.toObjectSortedByValues()))
core.info(toYaml(excluded))
core.endGroup()
const keystrokeList = Object.entries(keystrokeCounter.toObjectSortedByValues()).map(([key, value]) => {
  return {
    key,
    value,
    keystrokes: data.filter(entry => entry.key === key)
  }
})
keystrokeList.reverse()
for (const entry of keystrokeList) {
  core.startGroup(`Keystroke ${entry.key} (${entry.value})`)
  core.info(toYaml(entry.keystrokes))
  core.endGroup()
}