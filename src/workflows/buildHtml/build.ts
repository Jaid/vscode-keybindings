// @ts-nocheck
import path from 'node:path'
import {fileURLToPath} from 'node:url'

import fs from 'fs-extra'
import readFileString from 'read-file-string'
import showdown from 'showdown'

import collectData from './collectData.js'
import createHtml from './createHtml.js'
import createMarkdown from './createMarkdown.js'

const dirName = path.dirname(fileURLToPath(import.meta.url))

const data = await collectData()
const md = createMarkdown({data})
const converter = new showdown.Converter({
  tables: true,
})
const html = createHtml({
  showdownContent: converter.makeHtml(md),
  style: await readFileString.default(path.join(dirName, `page.css`)),
})
// await fs.writeFile(path.join(outputFolder, `index.md`), md)
fs.outputFile(path.join(`dist`, `index.html`), html)
