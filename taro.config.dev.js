import { defineConfig } from '@tarojs/cli'

export default defineConfig({
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
