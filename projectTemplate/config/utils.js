import path from 'path'
import fs from 'fs'
import userConfigs from './userConfig'

const appRoot = path.join(__dirname, '..')

/**
 * 导出别名
 * @returns
 */
export const getAlias = () => Object.fromEntries(
  fs
    .readdirSync(path.join(appRoot, 'src'))
    .filter(file => {
      const stat = fs.lstatSync(path.join(appRoot, 'src', file))
      return stat.isDirectory()
    })
    .map(file => ['@/' + file, path.join(appRoot, 'src', file)])
)

const parseConfig = async (configs, config, ...args) => {
  if (typeof config === 'function') {
    config = config(...args)
  }
  if (config instanceof Promise) {
    config = await config
  }
  configs.push(config)
}

export const getAppConfig = async (type, ...args) => {

  const configs = [...userConfigs.index, ...userConfigs[type]]

  const result = []

  for (let i = 0; i < configs.length; i++) {
    await parseConfig(result, configs[i], ...args)
  }

  return result
}
