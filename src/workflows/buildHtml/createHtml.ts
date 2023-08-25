import path from 'node:path'
import {fileURLToPath} from 'node:url'

import Handlebars from 'handlebars'
import readFileString from 'read-file-string'

const dirName = path.dirname(fileURLToPath(import.meta.url))

const handlebars = Handlebars.create()
const htmlTemplate = await readFileString.default(path.join(dirName, `template.html.hbs`))
const htmlTemplateInvoker = handlebars.compile(htmlTemplate, {
  noEscape: true,
})
export default htmlTemplateInvoker
