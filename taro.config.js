import { defineConfig } from '@tarojs/cli'
import { resolve } from 'path'

export default defineConfig({
  mini: {
    webpackChain(chain) {
      rule(chain)
    }
  },
  h5: {
    webpackChain(chain) {
      rule(chain)
    }
  }
})

const rule = chain => {
  const scssVarLoaderPath = resolve(process.cwd(), 'src/duxapp/theme-loader.js')

  chain.module.rule('scss').test(/\.scss$/)
    .oneOf('0')
    .use('duxapp-theme-loader')
    .loader(scssVarLoaderPath)
    .end()
}
