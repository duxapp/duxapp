/* eslint-disable import/no-commonjs */
const { readFileSync, existsSync } = require('fs')
const { resolve } = require('path')

module.exports = (() => {
  if (['harmony_cpp'].includes(process.env.TARO_ENV)) {
    return v => v
  }
  const duxapp = resolve(process.cwd(), 'dist/duxapp.json')
  if (!existsSync(duxapp)) {
    console.log('主题处理失败 duxapp.json 文件不存在')
    return v => v
  }
  function replaceScssVars(content, varNames) {
    const targetVars = new Set(varNames)

    // 过滤主题文件
    if (content.includes('$duxappPrimaryColor: #337ab7;')) {
      return content
    }

    // 修正后的驼峰转短横线函数，正确处理连续大写
    const toKebabCase = (str) =>
      str
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')  // 处理连续大写后跟大写+小写
        .replace(/([a-z])([A-Z])/g, '$1-$2')  // 处理普通驼峰
        .toLowerCase()

    // 匹配变量引用（排除定义行和插值语法）
    return content.replace(/([^:\$])\$([a-zA-Z0-9_-]+)/g, (match, prefix, varName) => {
      // 排除 &:hover 等特殊情况
      if (prefix === '&') return match

      // 只替换目标变量
      return targetVars.has(varName)
        ? `${prefix}var(--${toKebabCase(varName)})`
        : match
    })
  }

  try {
    const names = JSON.parse(readFileSync(duxapp))?.themeVarNames
    return source => {
      return replaceScssVars(source, names)
    }
  } catch (error) {
    console.log(`主题变量名读取失败`, error)
    return v => v
  }
})()
