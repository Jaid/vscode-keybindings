// @ts-nocheck
import path from "node:path"

import {context} from "@actions/github"
import fs from "fs-extra"
import {globbyStream} from "globby"
import lodash from "lodash-es"
import preventStart from "prevent-start"
import readFileYaml from "read-file-yaml"

const globbyIterator = globbyStream(`*.yml`, {
  cwd: `src`,
  objectMode: true,
  absolute: true,
})
const additions = []
const deletions = []
for await (const globbyEntry of globbyIterator) {
  console.dir(globbyEntry)
  const data = await readFileYaml.default(globbyEntry.path)
  console.dir(data)
  for (const entry of data) {
    if (entry.command.startsWith(`-`)) {
      deletions.push(entry)
      continue
    }
    additions.push(entry)
  }
}
const output = [
  ...deletions,
  ...additions,
]
const id = preventStart.default(context.payload.repository.name, `vscode-`)
const packageManifest = {
  name: id,
  publisher: `jaidchen`,
  displayName: lodash.startCase(id),
  description: `Personal keybindings (also removes any default keybindings)`,
  version: `0.0.1`,
  engines: {
    vscode: `^1.80.0`,
  },
  categories: [`Keymaps`],
  contributes: {
    keybindings: output,
  },
}
await fs.outputFile(path.resolve(`dist`, `package.json`), JSON.stringify(packageManifest))