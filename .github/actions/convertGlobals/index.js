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
  'delete'
]
const github = JSON.parse(process.env.github)
const jsonPath = path.resolve(github.workspace, 'src', 'global.jsonc')
const data = await readFileJson.default(jsonPath)
const result = []
const excluded = []
for (const entry of data) {
  if (entry.command.startsWith('-')) {
    excluded.push(entry)
    continue
  }
  if (excludedKeystrokes.includes(entry.key)) {
    excluded.push(entry)
    continue
  }
  result.push(entry)
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