/* eslint-disable import/no-commonjs */
// babel-preset-taro 更多选项和默认值：
// https://github.com/NervJS/taro/blob/next/packages/babel-preset-taro/README.md
const babel = require('duxapp-cli/cjs/plugins/babel')
const configs = require('./babel.user.config.js')

module.exports = babel.merge({
  presets: [
    ['taro', {
      framework: 'react',
      ts: true,
      compiler: 'webpack5',
    }]
  ]
}, ...configs)
