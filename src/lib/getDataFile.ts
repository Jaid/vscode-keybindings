import path from 'node:path'

export default () => {
  if (process.env.dataFile) {
    console.log((path.join(process.env.dataFile, 'out', 'data.yml')))
    return path.join(process.env.dataFile, `out`, `data.yml`)
  }
  console.log((path.join('out', 'data.yml')))
  return path.join(`out`, `data.yml`)
}