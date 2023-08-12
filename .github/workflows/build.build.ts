// @ts-nocheck
import readFileYaml from 'read-file-yaml'
import {globbyStream} from 'globby'
import * as core from '@actions/core'
import path from "path"

const steps = JSON.parse(process.env.steps)
console.dir(steps)

config = {}

const globbyIterator = globbyStream('*.yml', {
  cwd: 'src',
  objectMode: true,
  absolute: true
})
const additions = []
const deletions = []
for await (const globbyEntry of globbyIterator) {
  const id = path.basename(globalEntry.name, '.yml')
  config[id] = []
  const data = await readFileYaml.default(globbyEntry.path)
  for (const entry of data) {
    config[id].push(entry)
    if (entry.command.startsWith('-')) {
      deletions.push(entry)
      continue
    }
    additions.push(entry)
  }
}
const output = {
  config,
  deletions,
  additions
}
core.setOutput('value', JSON.stringify(output))