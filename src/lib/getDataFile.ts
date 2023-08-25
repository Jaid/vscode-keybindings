import path from 'node:path'

export default () => {
  if (process.env.dataFile) {
    return path.join(process.env.dataFile, `out`, `data.yml`)
  } else {
    return path.join(`out`, `data.yml`)
  }
}
