/* eslint-disable import/no-commonjs */
const { mergeConfig } = require('metro-config')
const { getMetroConfig } = require('@tarojs/rn-supporter')

module.exports = mergeConfig({
  // custom your metro config here
  // https://facebook.github.io/metro/docs/configuration
  resolver: {},
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
}, getMetroConfig())
