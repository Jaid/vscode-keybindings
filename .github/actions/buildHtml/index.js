// @ts-nocheck
import {context} from '@actions/github'
import fs from 'fs-extra'
import path from 'path'
const outputPath = path.resolve(process.env.GITHUB_WORKSPACE, 'dist', "index.html")
await fs.outputFile(outputPath, "test")