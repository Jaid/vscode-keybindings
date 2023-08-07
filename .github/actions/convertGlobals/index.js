// @ts-nocheck
import core from '@actions/core'
import fs from 'fs-extra'
import yaml from 'yaml'
import path from 'path'
import readFileJson from 'read-file-json'
import KeyCounter from 'key-counter'
const excludedKeystrokes = [
  'escape escape',
  /^(|(ctrl|alt|shift|ctrl\+shift|ctrl\+shift\+alt)\+)(up|left|right|down)$/,
  /^(|(ctrl|alt|shift|ctrl\+shift|ctrl\+shift\+alt)\+)(end|home|pageup|pagedown)$/,
  /^(|(ctrl|alt|shift|ctrl\+shift|ctrl\+shift\+alt)\+)(backspace|delete|tab|enter|escape)$/,
]
const github = JSON.parse(process.env.github)
const jsonPath = path.resolve(github.workspace, 'src', 'global.jsonc')
const data = await readFileJson.default(jsonPath)
const result = []
const excluded = []
const exclusionCounter = new KeyCounter
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
  return true
}
for (const entry of data) {
  const include = shouldInclude(entry)
  if (include) {
    result.push(entry)
  } else {
    excluded.push(entry)
  }
}
core.info(`Loaded ${Object.keys(data).length} global keybindings from ${jsonPath}`)
core.info(`Included ${result.length}, excluded ${data.length - result.length}`)
const yamlString = toYaml(result)
core.startGroup('YAML output')
core.info(yamlString)
core.endGroup()
core.startGroup('Excluded')
core.info(`Excluded ${excluded.length} keybindings`)
core.info(toYaml(exclusionCounter.toObjectSortedByValues()))
core.info(toYaml(excluded))
core.endGroup()