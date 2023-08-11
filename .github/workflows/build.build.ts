// @ts-nocheck
import readFileYaml from 'read-file-yaml'
import {globbyStream} from 'globby'
import * as core from '@actions/core'

const globbyIterator = globbyStream('*.yml', {
  cwd: 'src',
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
const output = {
  ...deletions,
  ...additions
}
core.setOutput('value', JSON.stringify(output))