// @ts-nocheck
import core from '@actions/core'
import fs from 'fs-extra'
import yaml from 'yaml'
import path from 'path'
import readFileJson from 'read-file-json'
const github = JSON.parse(process.env.github)
const jsonPath = path.resolve(github.workspace, 'src', 'global.jsonc')
const data = await readFileJson.default(jsonPath)
core.info(`Loaded ${Object.keys(data).length} global keybindings from ${jsonPath}`)
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