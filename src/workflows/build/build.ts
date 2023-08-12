// @ts-nocheck
import path from 'node:path'

import * as core from '@actions/core'
import fs from 'fs-extra'
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

const config = {
  global: {
    title: `Default`,
    keystrokes: globalData.result,
  },
}

const additions = []
const deletions = []
for (const [id, entry] of Object.entries(config)) {
  if (entry.keystrokes.length) {
    continue
  }
  const data = await readFileYaml.default(path.join(`src`, `${id}.yml`))
  for (const keystrokeEntry of data) {
    config[id].push(keystrokeEntry)
    if (keystrokeEntry.command.startsWith(`-`)) {
      deletions.push(keystrokeEntry)
      continue
    }
    additions.push(keystrokeEntry)
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