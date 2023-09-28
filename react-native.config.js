/* eslint-disable import/no-commonjs */
const fs = require('fs')
const path = require('path')

const getDependenciesConfig = () => {

  const getPath = (...names) => path.join(__dirname, ...names)

  let config = {}
  if (fs.existsSync(getPath('dist', 'react-native-config.json'))) {
    config = require(getPath('dist', 'react-native-config.json'))
  }

  return config.dependencies || {}
}

module.exports = {
  dependencies: {
    ...getDependenciesConfig()
  }
}
