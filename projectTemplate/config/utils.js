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
    .filter(app => {
      const stat = fs.lstatSync(path.join(appRoot, 'src', app))
      return stat.isDirectory()
    })
    .map(app => {
      let realApp = app
      const config = JSON.parse(fs.readFileSync(path.join(appRoot, 'src', app, 'app.json')))
      if (config.deprecated?.alias) {
        realApp = config.deprecated.alias
      }
      return ['@/' + app, path.join(appRoot, 'src', realApp)]
    })
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
