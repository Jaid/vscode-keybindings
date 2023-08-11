// @ts-nocheck
import core from '@actions/core'
import {context} from '@actions/github'
import fs from 'fs-extra'
import path from 'path'
import showdown from 'showdown'
import readFileString from 'read-file-string'
import Handlebars from 'handlebars'
import {fileURLToPath} from "node:url"

const inputs = JSON.parse(process.env.inputs)
console.dir(inputs)

const setOutput = (value, name = 'value') => {
  core.setOutput(name, value)
  core.info(`Output ${name}: ${value}`)
}

const dirName = path.dirname(fileURLToPath(import.meta.url))

const handlebars = Handlebars.create()
const template = await readFileString.default(path.resolve(dirName, 'buildHtml.template.md.hbs'))
const templateInvoker = handlebars.compile(template)
const md = templateInvoker()
const htmlTemplate = await readFileString.default(path.resolve(dirName, 'buildHtml.template.html.hbs'))
const htmlTemplateInvoker = handlebars.compile(htmlTemplate)
const converter = new showdown.Converter
converter.setFlavor('github')
const html = htmlTemplateInvoker({
  showdownContent: converter.makeHtml(md)
})
const outputFolder = 'dist'
const mdFile = path.resolve(outputFolder, 'index.md')
const htmlFile = path.resolve(outputFolder, 'index.html')
await fs.ensureDir(outputFolder)
const outputJobs = [
  fs.writeFile(mdFile, md),
  fs.writeFile(htmlFile, html)
]
await Promise.all(outputJobs)
setOutput(md, 'markdown')