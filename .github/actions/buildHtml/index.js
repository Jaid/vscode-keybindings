// @ts-nocheck
import {context} from '@actions/github'
import fs from 'fs-extra'
import path from 'path'
await fs.outputFile(path.resolve(process.env.RUNNER_WORKSPACE, 'dist', "a.html"), "test")