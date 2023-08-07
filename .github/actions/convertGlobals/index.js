// @ts-nocheck
import fs from 'fs-extra'
import path from 'path'
import readFileJson from 'read-file-json'
const jsonPath = path.resolve(github.workspace, 'src', 'keybindings.json')
const data = await readFileJson.default(jsonPath)
console.dir(data)
// await fs.outputFile(path.resolve(github.workspace, 'dist', "package.json"), JSON.stringify(packageManifest))