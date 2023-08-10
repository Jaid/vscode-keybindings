// @ts-nocheck
import fs from 'fs-extra'
import path from 'path'
await fs.outputFile(path.resolve(github.workspace, 'dist', "a.html"), "test")