import path from 'node:path'

import core from '@actions/core'
import readFileYaml from 'read-file-yaml'

import {Keybinding, KeyVisualization, RawKeybinding} from 'lib/Keybinding.js'

type DataEntry = {
  keystrokes: RawKeybinding[]
}

export type ExtendedKeybinding = Keybinding & {visualization: KeyVisualization}
export type Data = Record<string, DataEntry>
export type Group = "addition" | "deletion"
export type DataNormalized = Record<Group, Record<string, ExtendedKeybinding[]>>

export default async () => {
  const data: Data = await readFileYaml.default(path.join(process.env.RUNNER_WORKSPACE, `out`, `data.yml`))
  const dataNormalized: DataNormalized = {}
  for (const group of [`addition`, `deletion`] as Group[]) {
    for (const [id, entry] of Object.entries(data)) {
      const keybindings = entry.keystrokes.map(Keybinding.fromRaw)
      const filteredKeybindings = keybindings.filter(keybinding => keybinding.getLogic() === group)
      if (!filteredKeybindings.length) {
        continue
      }
      if (!dataNormalized[group]) {
        dataNormalized[group] = {}
      }
      core.info(`${filteredKeybindings.length} ${group}s for ${id}`)
      // filteredKeybindings.sort((a, b) => {
      //   return a.compareTo(b)
      // })
      const dataExtended: (Keybinding & {visualization: KeyVisualization})[] = filteredKeybindings.map(keybinding => {
        return {
          ...keybinding,
          visualization: keybinding.asVisualization(),
        }
      })
      dataNormalized[group][id] = dataExtended
    }
  }
  return dataNormalized
}
