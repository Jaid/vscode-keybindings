import path from 'node:path'

import fs from 'fs-extra'
import readFileYaml from 'read-file-yaml'
import yaml from 'yaml'

import getDataFile from 'lib/getDataFile.js'
import {RawKeybinding, sortRaw} from 'lib/Keybinding.js'

import convertGlobals from './convertGlobals.js'

type DataEntry = {
  role: `doc` | `extension`
  keystrokes: RawKeybinding[]
}
export type Category = typeof categories[number]
export type Data = Record<Category, DataEntry>
type Config = Partial<Data>

const toYaml = input => yaml.stringify(input, null, {
  schema: `core`,
  lineWidth: 0,
  minContentWidth: 0,
  singleQuote: true,
  nullStr: `~`,
})

const globalData = convertGlobals()

const categories = [
  `keptDefaults`,
  `deletedDefaults`,
  `resetExtensions`,
  `jaid`,
  `editor`,
  `breakpoints`,
  `explorer`,
  `terminal`,
  `copilot`,
  `launch`,
  `tabs`,
  `actionsJavascript`,
  `actions`,
  `git`,
] as const
const config: Config = {
  deletedDefaults: {
    keystrokes: globalData.result,
    role: `extension`,
  },
  keptDefaults: {
    keystrokes: globalData.excluded,
    role: `doc`,
  },
}
const result: Partial<Data> = {}
for (const category of categories) {
  if (config[category]) {
    result[category] = config[category]
    continue
  }
  const role = `extension`
  const keystrokes: RawKeybinding[] = await readFileYaml.default(path.join(`src`, `units`, `${category}.yml`))
  keystrokes.sort(sortRaw)
  result[category] = {
    role,
    keystrokes,
  }
}
const yamlOutput = toYaml(result)
await fs.outputFile(getDataFile(), yamlOutput)
