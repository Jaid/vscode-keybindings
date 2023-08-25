import path from 'node:path'

import fs from 'fs-extra'
import * as lodash from 'lodash-es'
import preventStart from 'prevent-start'
import readFileJson from 'read-file-json'

import {RawKeybinding} from 'lib/Keybinding.js'
import loadData from 'lib/loadData.js'

const packageJson = await readFileJson.default(`package.json`)
const keybindings: RawKeybinding[] = []
const data = await loadData()
for (const entry of Object.values(data)) {
  if (entry.role === `doc`) {
    continue
  }
  keybindings.push(...entry.keystrokes)
}

const id = preventStart.default(packageJson.name, `vscode-`)
const packageManifest = {
  name: id,
  publisher: `jaidchen`,
  displayName: lodash.startCase(id),
  contributes: {
    keybindings,
  },
  ...lodash.pick(packageJson, [`repository`, `homepage`, `version`, `description`, `engines`, `categories`]),
}
await fs.outputFile(path.join(`dist`, `package.json`), JSON.stringify(packageManifest))
