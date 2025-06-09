import path from 'path'
import fs from 'fs'
import util from 'duxapp-cli/lib/util'

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

const parseConfig = async (configs, configFile, ...args) => {
  if (!fs.existsSync(configFile)) {
    return
  }
  let config = require(configFile)
  if (typeof config === 'function') {
    config = config(...args)
  }
  if (config instanceof Promise) {
    config = await config
  }
  configs.push(config)
}

export const getAppConfig = async (type, ...args) => {

  const apps = util.getApps()

  const configs = []
  for (let i = 0; i < apps.length; i++) {
    const appDir = path.join(appRoot, 'src', apps[i])

    await parseConfig(configs, path.join(appDir, 'taro.config.js'), ...args)
    await parseConfig(configs, path.join(appDir, `taro.config.${type}.js`), ...args)
  }

  return configs
}
