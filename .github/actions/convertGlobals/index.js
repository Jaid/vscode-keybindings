// @ts-nocheck
import fs from 'fs-extra'
import yaml from 'yaml'
import path from 'path'
import readFileJson from 'read-file-json'
const github = JSON.parse(process.env.github)
const jsonPath = path.resolve(github.workspace, 'src', 'global.jsonc')
const data = await readFileJson.default(jsonPath)
const yamlString = yaml.stringify(data, null, {
  schema: 'core',
  doubleQuotedMinMultiLineLength: 10000,
  lineWidth: 0,
  minContentWidth: 0,
  singleQuote: true
})
console.log(yamlString)