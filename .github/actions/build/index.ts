// @ts-nocheck
import core from '@actions/core'
// import toYaml from './lib/toYaml'

import {fileURLToPath} from "node:url"

const dirName = path.dirname(fileURLToPath(import.meta.url))
console.log(dirName)

core.info(toYaml({
  moin: 'servus'
}))