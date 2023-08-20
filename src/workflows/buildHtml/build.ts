// @ts-nocheck
import path from 'node:path'
import {fileURLToPath} from 'node:url'

import core from '@actions/core'
import {context} from '@actions/github'
import fs from 'fs-extra'
import Handlebars from 'handlebars'
import * as lodash from 'lodash-es'
import readFileString from 'read-file-string'
import readFileYaml from 'read-file-yaml'
import showdown from 'showdown'

import {Keybinding, RawKeybinding} from 'lib/Keybinding.ts'

const dirName = path.dirname(fileURLToPath(import.meta.url))

const setOutput = (value, name = `value`) => {
  core.setOutput(name, value)
  core.info(`Output ${name}: ${value}`)
}

type DataEntry = {
  keystrokes: RawKeybinding[]
}

type Data = Record<string, DataEntry>

const data: Data = await readFileYaml.default(path.join(process.env.RUNNER_WORKSPACE, `out`, `data.yml`))
const dataNormalized: Record<string, Record<string, Keybinding[]>> = {}
for (const group of [`addition`, `deletion`]) {
  for (const [id, entry] of Object.entries(data)) {
    const keybindings = entry.keystrokes.map(Keybinding.fromRaw)
    const filteredKeybindings = keybindings.filter(keybinding => keybinding.getLogic() === group)
    if (!filteredKeybindings.length) {
      continue
    }
    if (!dataNormalized[group]) {
      dataNormalized[group] = {}
    }
    core.info(`${filteredKeybindings.length} ${group}s for ${id}`)
    filteredKeybindings.sort(Keybinding.compare)
    dataNormalized[group][id] = filteredKeybindings
  }
}
console.dir(dataNormalized, {depth: Number.POSITIVE_INFINITY})
core.info(JSON.stringify(dataNormalized))
const handlebars = Handlebars.create()
handlebars.registerHelper(`isKey`, value => {
  return value === `key`
})
handlebars.registerHelper(`formatKey`, value => {
  return value.replace(/^oem_/, `OEM `).toUpperCase()
})
handlebars.registerHelper(`startCase`, value => {
  return lodash.startCase(value)
})
const template = await readFileString.default(path.resolve(dirName, `template.md.hbs`))
const templateInvoker = handlebars.compile(template, {
  compat,
})
const md = templateInvoker({data: dataNormalized})
const htmlTemplate = await readFileString.default(path.resolve(dirName, `template.html.hbs`))
const htmlTemplateInvoker = handlebars.compile(htmlTemplate)
const converter = new showdown.Converter
converter.setFlavor(`github`)
const fontBuffer = await fs.readFile(path.resolve(dirName, `geologica.ttf`))
const html = htmlTemplateInvoker({
  showdownContent: converter.makeHtml(md),
  style: await readFileString.default(path.resolve(dirName, `page.css`)),
  fontDataUrl: `data:font/ttf;base64,${fontBuffer.toString(`base64`)}`,
})
const outputFolder = `dist`
const mdFile = path.resolve(outputFolder, `index.md`)
const htmlFile = path.resolve(outputFolder, `index.html`)
await fs.ensureDir(outputFolder)
const outputJobs = [
  fs.writeFile(mdFile, md),
  fs.writeFile(htmlFile, html),
]
await Promise.all(outputJobs)
setOutput(md, `markdown`)
