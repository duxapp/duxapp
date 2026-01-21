/* eslint-disable import/no-commonjs */
// babel-preset-taro 更多选项和默认值：
// https://github.com/NervJS/taro/blob/next/packages/babel-preset-taro/README.md
const deepmerge = require('deepmerge')
const { resolvePlugin, resolvePreset } = require('@babel/core')
const configs = require('./babel.user.config.js')

const arrayMergeUnique = (source = [], overrides = []) => [...new Set([...source, ...overrides])]

const isBabelTuple = value =>
  Array.isArray(value) &&
  value.length === 2 &&
  (typeof value[0] === 'string' || typeof value[0] === 'function') &&
  value[1] &&
  typeof value[1] === 'object' &&
  !Array.isArray(value[1])

const getTupleName = (item, resolver) => resolver(Array.isArray(item) ? item[0] : item)

function mergeNamedArray(source = [], overrides = [], resolver) {
  const result = [...(source || [])]
    ; (overrides || []).forEach(override => {
      const overrideName = getTupleName(override, resolver)
      const overrideOptions = isBabelTuple(override) ? override[1] : undefined

      const index = result.findIndex(base => {
        const baseName = getTupleName(base, resolver)
        return baseName === overrideName || baseName.includes(overrideName)
      })

      if (index === -1) {
        result.push(override)
        return
      }

      const base = result[index]
      const baseName = Array.isArray(base) ? base[0] : base
      const baseOptions = isBabelTuple(base) ? base[1] : undefined

      if (baseOptions || overrideOptions) {
        const options = deepmerge(baseOptions || {}, overrideOptions || {}, {
          arrayMerge: arrayMergeUnique
        })
        result[index] = Object.keys(options).length ? [baseName, options] : baseName
      } else {
        result[index] = override
      }
    })

  return result
}

function babelMerge(source = {}, overrides = {}) {
  const plugins = mergeNamedArray(source.plugins, overrides.plugins, resolvePlugin)
  const presets = mergeNamedArray(source.presets, overrides.presets, resolvePreset)

  const sourceEnv = source.env || {}
  const overridesEnv = overrides.env || {}
  const envNames = [...new Set([...Object.keys(sourceEnv), ...Object.keys(overridesEnv)])]

  const mergedEnv = envNames.reduce((acc, name) => {
    acc[name] = babelMerge(sourceEnv[name] || {}, overridesEnv[name] || {})
    return acc
  }, {})

  const merged = deepmerge.all(
    [
      deepmerge(source, {}, { arrayMerge: arrayMergeUnique }),
      deepmerge(overrides, {}, { arrayMerge: arrayMergeUnique }),
      envNames.length ? { env: mergedEnv } : {}
    ].map(cfg => {
      const { plugins: _plugins, presets: _presets, env: _env, ...rest } = cfg || {}
      return rest
    }),
    { arrayMerge: arrayMergeUnique }
  )

  if (presets.length) merged.presets = presets
  if (plugins.length) merged.plugins = plugins
  if (envNames.length) merged.env = mergedEnv

  return merged
}

function merge(source, ...overrides) {
  return overrides.reduce((acc, override) => (override ? babelMerge(acc, override) : acc), source || {})
}

module.exports = merge(
  {
    presets: [
      [
        'taro',
        {
          framework: 'react',
          ts: true,
          compiler: 'webpack5'
        }
      ]
    ]
  },
  ...(configs || [])
)
