/* eslint-disable import/no-commonjs */
const { getAlias, getAppConfig } = require('./utils')
const path = require('path')
const duxapp = require('duxapp-cli/plugins')

const config = {
  projectName: 'duxapp',
  date: '2022-1-1',
  designWidth: 750,
  deviceRatio: {
    375: 2,
    640: 2.34 / 2,
    750: process.env.TARO_ENV === 'h5' ? 640 / 750 : 1,
    828: 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: `dist/${process.env.TARO_ENV}`,
  plugins: [
    ...duxapp.taroPlugin()
  ],
  defineConstants: {
  },
  copy: {
    patterns: [
    ],
    options: {
    }
  },
  framework: 'preact',
  compiler: {
    type: 'webpack5',
    // 仅 webpack5 支持依赖预编译配置
    prebundle: {
      /**
       * 3.6.7版本小程序命令行封装报错，暂时关掉此选项解决
       */
      enable: false,
      exclude: ['taro-design']
    }
  },
  cache: {
    enable: false, // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
    buildDependencies: {
      config: [path.resolve(__dirname, '..', 'src/theme.scss')],
    },
  },
  alias: getAlias(),
  sass: {
    resource: [
      path.resolve(__dirname, '..', 'src/theme.scss')
    ],
  },
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {

        }
      },
      url: {
        enable: true,
        config: {
          limit: 1024 // 设定转换尺寸上限
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
    webpackChain(chain) {
      chain.resolve.plugin('MultiPlatformPlugin')
        .tap(args => {
          args[2]['include'] = ['taro-design']
          return args
        })
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
    output: {
      ios: './ios/main.jsbundle',
      iosAssetsDest: './ios',
      // iosSourcemapOutput: './ios/main.map',
      // iosSourceMapUrl: '',
      // iosSourcemapSourcesRoot: '',
      android: './android/app/src/main/assets/index.android.bundle',
      androidAssetsDest: './android/app/src/main/res',
      // androidSourceMapUrl: '',
      // androidSourcemapOutput: './android/app/src/main/assets/index.android.map',
      // androidSourcemapSourcesRoot: '',
    },
    postcss: {
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
      }
    },
    resolve: {
      include: ['taro-design']
    }
  }
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, getAppConfig('dev'), require('./dev'))
  }
  return merge({}, config, getAppConfig('prod'), require('./prod'))
}
