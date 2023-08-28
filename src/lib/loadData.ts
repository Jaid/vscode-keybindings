import path from 'node:path'

import fs from 'fs-extra'
import readFileYaml from 'read-file-yaml'

import getDataFile from 'lib/getDataFile.js'
import Keybinding, {KeyVisualization} from 'lib/Keybinding.js'

import {Data} from 'src/workflows/build/build.js'

export type ExtendedKeybinding = Keybinding & {visualization: KeyVisualization}

export default async () => {
  const data: Data = await readFileYaml.default(getDataFile())
  if (!data) {
    const file = path.resolve(getDataFile())
    const folder = path.dirname(file)
    const folderExists = await fs.pathExists(folder)
    if (!folderExists) {
      throw new Error(`No data folder found at ${folder}`)
    }
    const fileExists = await fs.pathExists(file)
    if (!fileExists) {
      throw new Error(`No data file found at ${file}`)
    }
    const fileStats = await fs.stat(getDataFile())
    console.dir(fileStats)
    throw new Error(`No data loaded from ${file}`)
  }
  return data
}
