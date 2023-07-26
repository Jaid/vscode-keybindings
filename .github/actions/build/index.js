// @ts-nocheck
import core from '@actions/core'
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
const packageManifest = {
  "name": "jaid-keybindings",
  "displayName": "Jaid Keybindings",
  "description": "Personal keybindings (also removes any default keybindings)",
  "version": "1.0.0",
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
await fs.outputFile(path.resolve(github.workspace, 'dist', "package.json"), JSON.stringify(packageManifest))