import yaml from 'yaml'

export default (input): string => yaml.stringify(input, null, {
  schema: 'core',
  lineWidth: 0,
  minContentWidth: 0,
  singleQuote: true,
  nullStr: '~'
})
