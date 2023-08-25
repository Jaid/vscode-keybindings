import path from 'node:path'

export default () => {
  return path.join(process.env.dataFile ?? process.cwd(), `out`, `data.yml`)
}
