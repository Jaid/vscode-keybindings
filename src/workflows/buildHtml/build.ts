// @ts-nocheck
import path from 'node:path'
import {fileURLToPath} from 'node:url'

import core from '@actions/core'
import {context} from '@actions/github'
import fs from 'fs-extra'
import Handlebars from 'handlebars'
import lodash from 'lodash-es'
import readFileString from 'read-file-string'
import readFileYaml from 'read-file-yaml'
import showdown from 'showdown'

const dirName = path.dirname(fileURLToPath(import.meta.url))

const setOutput = (value, name = `value`) => {
  core.setOutput(name, value)
  core.info(`Output ${name}: ${value}`)
}

const data = await readFileYaml.default(path.join(process.env.RUNNER_WORKSPACE, `out`, `data.yml`))
const dataNormalized = {
  additions: {},
  deletions: {},
}
const normalizeKeystrokes = keystrokes => {
  const getKeystrokeOrder = keystroke => {
    const key: string = keystroke.key
    const lastKey = lodash.last(key.split(/[ +|]/g))
    if (/^f\d{1,2}$/.test(lastKey)) {
      return `-${lastKey}`
    }
    return lastKey
  }
  const getKeystrokeModifierOrder = keystroke => {
    const key: string = keystroke.key
    const modifiers = key.split(/[ +|]/g).filter(part => part !== ` ` && part !== `+`).slice(0, -1)
    return modifiers.length
  }
  const sorted = lodash.orderBy(keystrokes, [getKeystrokeOrder, getKeystrokeModifierOrder, `command`, `when`])
  return sorted.map(keystroke => {
    const keyVisualization = keystroke.key.split(/([ +|])/g).map(part => {
      if (part === ` `) {
        return {
          type: `connector`,
          value: ` → `,
        }
      }
      if (part === `+`) {
        return {
          type: `connector`,
          value: ` `,
        }
      }
      return {
        type: `key`,
        value: part,
      }
    })
    return {
      ...keystroke,
      keyVisualization,
    }
  })
}
for (const [id, entry] of Object.entries(data)) {
  const [deletions, additions] = lodash.partition(entry.keystrokes, keystroke => keystroke.command.startsWith(`-`))
  if (additions.length) {
    core.info(`${additions.length} additions for ${id}`)
    dataNormalized.additions[id] = normalizeKeystrokes(additions)
  }
  if (deletions.length) {
    core.info(`${deletions.length} deletions for ${id}`)
    dataNormalized.deletions[id] = normalizeKeystrokes(deletions)
  }
}
core.info(JSON.stringify(dataNormalized))
console.dir(dataNormalized, {depth: Number.POSITIVE_INFINITY})
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
const templateInvoker = handlebars.compile(template)
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