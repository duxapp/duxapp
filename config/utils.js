/* eslint-disable import/no-commonjs */
const path = require('path')
const fs = require('fs')

const appRoot = path.join(__dirname, '..')

/**
 * 获取本地插件
 * @returns
 */
const getPlugins = () => fs
  .readdirSync(path.join(appRoot, 'plugins'))
  .map((pluginFile) => path.join(appRoot, 'plugins', pluginFile))

/**
 * 导出别名
 * @returns
 */
const getAlias = () => Object.fromEntries(
  fs
    .readdirSync(path.join(appRoot, 'src'))
    .filter(file => {
      const stat = fs.lstatSync(path.join(appRoot, 'src', file))
      return stat.isDirectory()
    })
    .map(file => ['@/' + file, path.join(appRoot, 'src', file)])
)

const getAppConfig = type => {
  const customAppsArgv = process.argv.find(item => item.startsWith('--apps='))

  let appName
  if (customAppsArgv) {
    appName = customAppsArgv.split('=')[1].split(',')[0]
  }
  let fileDir = ''
  if (appName) {
    let fileName = `taro.config${type ? '.' + type : ''}.js`
    fileDir = path.join(appRoot, 'src', appName)
    if (fs.existsSync(path.join(fileDir, fileName))) {
      fileDir = path.join(fileDir, fileName)
    } else if (fs.existsSync(path.join(fileDir, 'taro.config.js'))) {
      fileDir = path.join(fileDir, 'taro.config.js')
    } else {
      appName = ''
    }
  }

  if (appName) {
    return require(fileDir)
  }
  return {}
}

module.exports = {
  appRoot,
  getAppConfig,
  getPlugins,
  getAlias
}
