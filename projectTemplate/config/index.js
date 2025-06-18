import { defineConfig } from '@tarojs/cli'
import { taroPlugin } from 'duxapp-cli/cjs/plugins/index'
import path from 'path'
import { getAlias, getAppConfig } from './utils'

import devConfig from './dev'
import prodConfig from './prod'

// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig(async (merge, ...args) => {
  const baseConfig = {
    projectName: 'duxapp',
    date: '2024-1-1',
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2
    },
    sourceRoot: 'src',
    outputRoot: `dist/${process.env.TARO_ENV}`,
    plugins: [
      ...taroPlugin()
    ],
    defineConstants: {
    },
    copy: {
      patterns: [
      ],
      options: {
      }
    },
    framework: 'react',
    compiler: {
      type: 'webpack5',
      // 仅 webpack5 支持依赖预编译配置
      prebundle: {
        /**
         * 4.0.5版本小程序命令行封装报错，暂时关掉此选项解决
         */
        enable: false
      }
    },
    cache: {
      enable: false, // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
      buildDependencies: {
        config: [path.resolve(__dirname, '..', 'src/theme.scss')],
      },
    },
    alias: getAlias(),
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {

          }
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      },
      miniCssExtractPluginOption: {
        //忽略css文件引入顺序
        ignoreOrder: true
      },
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',
      postcss: {
        autoprefixer: {
          enable: true,
          config: {
          }
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      },
      output: {
        filename: 'js/[name].[hash:8].js',
        chunkFilename: 'js/[name].[chunkhash:8].js'
      },
      miniCssExtractPluginOption: {
        filename: 'css/[name].[hash:8].css',
        chunkFilename: 'css/[id].[chunkhash:8].css'
      },
    },
    rn: {
      appName: 'duxapp',
      postcss: {
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        }
      }
    }
  }
  if (process.env.NODE_ENV === 'development') {
    return merge({}, baseConfig, devConfig, ...(await getAppConfig('dev', merge, ...args)))
  }
  return merge({}, baseConfig, prodConfig, ...(await getAppConfig('prod', merge, ...args)))
})

