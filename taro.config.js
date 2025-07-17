import { defineConfig } from '@tarojs/cli'
import { resolve } from 'path'
import customRoutes from '../../dist/duxapp-alias.json'

const scss = !['rn'].includes() ? {
  sass: {
    resource: [
      resolve(__dirname, '..', '..', 'src/theme.scss')
    ]
  }
} : {}

export default defineConfig({
  ...scss,
  mini: {
    webpackChain(chain) {
      rule(chain)
    }
  },
  h5: {
    webpackChain(chain) {
      rule(chain)
    },
    router: {
      customRoutes
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
