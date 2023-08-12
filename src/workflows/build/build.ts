// @ts-nocheck
import path from 'node:path'

import * as core from '@actions/core'
import fs from 'fs-extra'
import {globbyStream} from 'globby'
import readFileYaml from 'read-file-yaml'
import yaml from 'yaml'

import convertGlobals from './convertGlobals.ts'

const toYaml = input => yaml.stringify(input, null, {
  schema: `core`,
  lineWidth: 0,
  minContentWidth: 0,
  singleQuote: true,
  nullStr: `~`,
})

const globalData = convertGlobals()

const config = {}

const globbyIterator = globbyStream(`*.yml`, {
  cwd: `src`,
  objectMode: true,
  absolute: true,
})
const additions = []
const deletions = []
for await (const globbyEntry of globbyIterator) {
  const id = path.basename(globbyEntry.name, `.yml`)
  config[id] = []
  const data = await readFileYaml.default(globbyEntry.path)
  for (const entry of data) {
    config[id].push(entry)
    if (entry.command.startsWith(`-`)) {
      deletions.push(entry)
      continue
    }
    additions.push(entry)
  }
}
const output = {
  config,
  deletions,
  additions,
  globalData,
}
const yamlOutput = toYaml(output)
await fs.outputFile(path.join(process.env.RUNNER_WORKSPACE, `out`, `data.yml`), yamlOutput)