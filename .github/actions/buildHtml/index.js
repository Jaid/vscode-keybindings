// @ts-nocheck
import {context} from '@actions/github'
import fs from 'fs-extra'
import path from 'path'
import showdown from 'showdown'
import Handlebars from 'handlebars'
import * as url from 'url';
import {fileURLToPath} from "node:url"

const dirName = path.dirname(fileURLToPath(import.meta.url))

const handlebars = Handlebars.create()
const template = await readFileString(path.resolve(dirName, 'template.hbs'))
const templateInvoker = handlebars.compile(template)
const md = templateInvoker()
const converter = new showdown.Converter
const html = converter.makeHtml(md)
const outputFolder = path.resolve(process.env.GITHUB_WORKSPACE, 'dist')
const mdFile = path.resolve(outputFolder, 'index.md')
const htmlFile = path.resolve(outputFolder, 'index.html')
await fs.ensureDir(outputFolder)
const outputJobs = [
  fs.writeFile(mdFile, md),
  fs.writeFile(htmlFile, html)
]
await Promise.all(outputJobs)