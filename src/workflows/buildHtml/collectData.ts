import path from 'node:path'

import core from '@actions/core'
import readFileYaml from 'read-file-yaml'

import getDataFile from 'lib/getDataFile.js'
import {Keybinding, KeyVisualization, RawKeybinding} from 'lib/Keybinding.js'

type DataEntry = {
  keystrokes: RawKeybinding[]
}

export type ExtendedKeybinding = Keybinding & {visualization: KeyVisualization}
export type Data = Record<string, DataEntry>
export const groups = [`addition`, `deletion`] as const
export type Group = typeof groups[number]
export type DataNormalized = Record<Group, Record<string, ExtendedKeybinding[]>>

export default async () => {
  const data: Data = await readFileYaml.default(getDataFile())
  const dataNormalized: Partial<DataNormalized> = {}
  for (const group of groups) {
    for (const [id, entry] of Object.entries(data)) {
      const keybindings = entry.keystrokes.map(Keybinding.fromRaw)
      const filteredKeybindings = keybindings.filter(keybinding => keybinding.getLogic() === group)
      if (!filteredKeybindings.length) {
        continue
      }
      if (!dataNormalized[group]) {
        dataNormalized[group] = {}
      }
      console.info(`${filteredKeybindings.length} ${group}s for ${id}`)
      const dataExtended: ExtendedKeybinding[] = filteredKeybindings.map(keybinding => {
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
