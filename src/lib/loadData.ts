import path from 'node:path'

import core from '@actions/core'
import readFileYaml from 'read-file-yaml'

import getDataFile from 'lib/getDataFile.js'
import {Keybinding, KeyVisualization, RawKeybinding} from 'lib/Keybinding.js'

import {Data} from 'src/workflows/build/build.js'

export type ExtendedKeybinding = Keybinding & {visualization: KeyVisualization}

export default async () => {
  const data: Data = await readFileYaml.default(getDataFile())
  if (!data) {
    throw new Error(`No data loaded from ${path.resolve(getDataFile())}`)
  }
  return data
}
