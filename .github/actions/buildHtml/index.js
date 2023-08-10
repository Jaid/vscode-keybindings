// @ts-nocheck
import {context} from '@actions/github'
import fs from 'fs-extra'
import path from 'path'
console.log(path.resolve(process.env.GITHUB_WORKSPACE, 'dist', "a.html"))
await fs.outputFile(path.resolve(process.env.GITHUB_WORKSPACE, 'dist', "a.html"), "test")