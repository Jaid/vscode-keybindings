// @ts-nocheck
import path from "node:path"
import {fileURLToPath} from "node:url"

import core from "@actions/core"
import {context} from "@actions/github"
import fs from "fs-extra"
import Handlebars from "handlebars"
import readFileString from "read-file-string"
import showdown from "showdown"

const inputs = JSON.parse(process.env.inputs)
console.dir(inputs.data)

const setOutput = (value, name = `value`) => {
  core.setOutput(name, value)
  core.info(`Output ${name}: ${value}`)
}

const dirName = path.dirname(fileURLToPath(import.meta.url))

const handlebars = Handlebars.create()
const template = await readFileString.default(path.resolve(dirName, `template.md.hbs`))
const templateInvoker = handlebars.compile(template)
const md = templateInvoker({
  ...inputs.data,
})
const htmlTemplate = await readFileString.default(path.resolve(dirName, `template.html.hbs`))
const htmlTemplateInvoker = handlebars.compile(htmlTemplate)
const converter = new showdown.Converter
converter.setFlavor(`github`)
const html = htmlTemplateInvoker({
  showdownContent: converter.makeHtml(md),
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