// @ts-nocheck
import core from '@actions/core'
import path from 'node:path'

import yaml from 'yaml'

export default input => yaml.stringify(input, null, {
  schema: 'core',
  lineWidth: 0,
  minContentWidth: 0,
  singleQuote: true,
  nullStr: '~'
})

import {fileURLToPath} from "node:url"

const dirName = path.dirname(fileURLToPath(import.meta.url))
console.log(dirName)

core.info(toYaml({
  moin: 'servus'
}))