import path from 'node:path'

import core from '@actions/core'
import readFileYaml from 'read-file-yaml'

import {Keybinding, KeyVisualization, RawKeybinding} from 'lib/Keybinding.js'


export type ExtendedKeybinding = Keybinding & {visualization: KeyVisualization}

export default async () => {
  const data: Data = await readFileYaml.default(path.join(process.env.RUNNER_WORKSPACE, `out`, `data.yml`))
  return data
}
