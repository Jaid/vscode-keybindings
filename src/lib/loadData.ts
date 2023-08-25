import path from 'node:path'

import fs from 'fs-extra'
import readFileYaml from 'read-file-yaml'

import getDataFile from 'lib/getDataFile.js'
import {Keybinding, KeyVisualization} from 'lib/Keybinding.js'

import {Data} from 'src/workflows/build/build.js'

export type ExtendedKeybinding = Keybinding & {visualization: KeyVisualization}

export default async () => {
  const data: Data = await readFileYaml.default(getDataFile())
  if (!data) {
    const fileStats = await fs.stat(getDataFile())
    console.dir(fileStats)
    throw new Error(`No data loaded from ${path.resolve(getDataFile())}`)
  }
  return data
}
