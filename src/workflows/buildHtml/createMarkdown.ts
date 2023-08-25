import path from 'node:path'
import {fileURLToPath} from 'node:url'

import Handlebars from 'handlebars'
import * as lodash from 'lodash-es'
import readFileString from 'read-file-string'

import {KeyVisualization} from 'lib/Keybinding.js'

const dirName = path.dirname(fileURLToPath(import.meta.url))

const handlebars = Handlebars.create()
handlebars.registerHelper(`isBaseKey`, (value: KeyVisualization) => {
  return value.type === `baseKey`
})
handlebars.registerHelper(`isModifierKey`, (value: KeyVisualization) => {
  return value.type === `modifierKey`
})
handlebars.registerHelper(`breakBefore`, (value: string, ...rest) => {
  const options = rest.at(-1) as Handlebars.HelperOptions
  const args = rest.slice(0, -1) as string[]
  const result = args.reduce((accumulator, currentValue) => {
    return accumulator.replaceAll(currentValue, `<wbr>${Handlebars.escapeExpression(currentValue)}`)
  }, value)
  return new Handlebars.SafeString(result)
})
handlebars.registerHelper(`startCase`, (value: string) => {
  return lodash.startCase(value)
})
const template = await readFileString.default(path.join(dirName, `template.md.hbs`))
const templateInvoker = handlebars.compile(template, {
  noEscape: true,
})
export default templateInvoker
