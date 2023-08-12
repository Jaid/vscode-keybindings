// @ts-nocheck
import path from 'node:path'

import * as core from '@actions/core'
import fs from 'fs-extra'
import lodash from 'lodash-es'
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
  deletedDefaults: {
    keystrokes: globalData.result,
    role: `extension`,
  },
  keptDefaults: {
    keystrokes: globalData.excluded,
    role: `doc`,
  },
  editor: {},
}
for (const [id, entry] of Object.entries(config)) {
  if (entry.keystrokes) {
    continue
  }
  entry.keystrokes = await readFileYaml.default(path.join(`src`, `${id}.yml`))
}
const output = {
  config,
  globalData,
}
const yamlOutput = toYaml(output)
await fs.outputFile(path.join(process.env.RUNNER_WORKSPACE, `out`, `data.yml`), yamlOutput)