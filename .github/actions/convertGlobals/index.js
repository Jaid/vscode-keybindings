// @ts-nocheck
import fs from 'fs-extra'
import path from 'path'
import readFileJson from 'read-file-json'
const github = JSON.parse(process.env.github)
const jsonPath = path.resolve(github.workspace, 'src', 'global.jsonc')
const data = await readFileJson.default(jsonPath)
console.dir(data)
// await fs.outputFile(path.resolve(github.workspace, 'dist', "package.json"), JSON.stringify(packageManifest))