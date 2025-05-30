// eslint-disable-next-line import/no-commonjs
const { defineConfig } = require('@tarojs/cli')

module.exports = defineConfig({
  h5: {
    // 关闭 H5 全屏弹出的警告
    devServer: {
      client: {
        overlay: false
      }
    },
    webpackChain(chain) {
      chain.plugin('fastRefreshPlugin').tap(args => {
        return [...args, { overlay: false }]
      })
    }
  }
})
