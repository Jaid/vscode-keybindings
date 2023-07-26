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
})
for await (const file of globbyIterator) {
  console.dir(file)
  const data = await readFileYaml.default(file)
  console.dir(data)
  const output = yaml.dump(data)
  const outputFile = path.resolve(github.workspace, 'dist', file)
  await fs.outputFile(outputFile, output)
}