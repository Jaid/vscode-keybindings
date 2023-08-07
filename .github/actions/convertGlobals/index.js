// @ts-nocheck
import core from '@actions/core'
import fs from 'fs-extra'
import yaml from 'yaml'
import path from 'path'
import readFileJson from 'read-file-json'
const excludedKeystrokes = [
  'escape',
  'escape escape',
  'down',
  'left',
  'right',
  'up',
  'backspace',
  'delete',
  'tab',
  'shift+left',
  'shift+right',
  'shift+up',
  'shift+down',
  'shift+escape',
  'enter'
]
const github = JSON.parse(process.env.github)
const jsonPath = path.resolve(github.workspace, 'src', 'global.jsonc')
const data = await readFileJson.default(jsonPath)
const result = []
const excluded = []
for (const entry of data) {
  let include = true
  if (entry.command.startsWith('-')) {
    include = false
  }
  if (excludedKeystrokes.includes(entry.key)) {
    include = false
  }
  if (include) {
    result.push(entry)
  } else {
    excluded.push(entry)
  }
}
core.info(`Loaded ${Object.keys(data).length} global keybindings from ${jsonPath}`)
core.info(`Included ${result.length}, excluded ${data.length - result.length}`)
const yamlString = yaml.stringify(data, null, {
  schema: 'core',
  lineWidth: 0,
  minContentWidth: 0,
  singleQuote: true,
  nullStr: '~'
})
core.startGroup('YAML output')
core.info(yamlString)
core.endGroup()
core.startGroup('Excluded')
core.info(yaml.stringify(excluded, null, {
  schema: 'core',
  lineWidth: 0,
  minContentWidth: 0,
  singleQuote: true,
  nullStr: '~'
}))
core.endGroup()