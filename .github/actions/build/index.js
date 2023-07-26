// @ts-nocheck
import core from '@actions/core'
import yaml from 'js-yaml'
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
  const output = [
    ...deletions,
    ...additions
  ]
  const outputPath = path.resolve(github.workspace, 'dist', "keybindings.json")
  await fs.outputFile(outputPath, JSON.stringify(output))
}