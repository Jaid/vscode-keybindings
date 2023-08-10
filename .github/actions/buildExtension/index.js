// @ts-nocheck
import {} from '@actions/core'
import * as context from '@actions/github'
import preventStart from 'prevent-start'
import lodash from "lodash"
console.dir(context)
import fs from 'fs-extra'
import path from 'path'
import readFileYaml from 'read-file-yaml'
import {globbyStream} from 'globby'
const github = JSON.parse(process.env.github)
const globbyIterator = globbyStream('*.yml', {
  cwd: path.resolve(github.workspace, 'src'),
  objectMode: true,
  absolute: true
})
const additions = []
const deletions = []
for await (const globbyEntry of globbyIterator) {
  console.dir(globbyEntry)
  const data = await readFileYaml.default(globbyEntry.path)
  console.dir(data)
  for (const entry of data) {
    if (entry.command.startsWith('-')) {
      deletions.push(entry)
      continue
    }
    additions.push(entry)
  }
}
const output = [
  ...deletions,
  ...additions
]
const id = preventStart.default(context.payload.repository.name, "vscode-")
const packageManifest = {
  "name": id,
  "publisher": "jaidchen",
  "displayName": lodash.startCase(id),
  "description": "Personal keybindings (also removes any default keybindings)",
  "version": "0.0.1",
  "engines": {
    "vscode": "^1.80.0"
  },
  "categories": [
    "Keymaps"
  ],
  "contributes": {
    "keybindings": output
  }
}
await fs.outputFile(path.resolve(context.workspace, 'dist', "package.json"), JSON.stringify(packageManifest))