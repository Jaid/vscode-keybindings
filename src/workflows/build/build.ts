import path from 'node:path'

import fs from 'fs-extra'
import readFileYaml from 'read-file-yaml'
import yaml from 'yaml'

import {Keybinding, RawKeybinding} from 'lib/Keybinding.js'

import convertGlobals from './convertGlobals.js'

export type Data = Record<string, DataEntry>

type DataEntry = {
  role: `doc` | `extension`
  keystrokes: RawKeybinding[]
}

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
}
const categories = [
  `deletedDefaults`,
  `keptDefaults`,
  `resetExtensions`,
  `jaid`,
  `editor`,
  `explorer`,
  `terminal`,
  `copilot`,
]
const result: Data = {}
for (const category of categories) {
  if (config[category]) {
    result[category] = config[category]
    continue
  }
  const resultEntry: Partial<DataEntry> = {
    role: `extension`,
  }
  const rawKeybindings: RawKeybinding[] = await readFileYaml.default(path.join(`src`, `${category}.yml`))
  const keybindings = rawKeybindings.map(Keybinding.fromRaw)
  keybindings.sort((a, b) => a.compareTo(b))
  resultEntry.keystrokes = keybindings.map(keybinding => keybinding.toRaw())
  result[category] = resultEntry as DataEntry
}
const yamlOutput = toYaml(result)
await fs.outputFile(path.join(process.env.RUNNER_WORKSPACE, `out`, `data.yml`), yamlOutput)
