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

  // 修正后的驼峰转短横线函数，正确处理连续大写
  const toKebabCase = str =>
    str
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')  // 处理连续大写后跟大写+小写
      .replace(/([a-z])([A-Z])/g, '$1-$2')  // 处理普通驼峰
      .toLowerCase()

  // 替换scss变量为var变量
  const replaceScssVars = (content, targetVars, resourcePath) => {

    // 过滤主题文件 src/theme.scss（主题文件主要用于定义 Sass 变量，不参与替换）
    // 优先使用 resourcePath（webpack/metro 可提供）；保留旧的内容特征兜底，避免无路径时误处理。
    const normalizedPath = typeof resourcePath === 'string' ? resourcePath.replace(/\\/g, '/') : ''
    if (normalizedPath.endsWith('/src/theme.scss') || content.includes('$duxappPrimaryColor: #337ab7;')) {
      return content
    }

    const isIdentStart = ch => /[a-zA-Z_-]/.test(ch)
    const isIdent = ch => /[a-zA-Z0-9_-]/.test(ch)
    const isWhitespace = ch => ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r' || ch === '\f'

    const prevNonWsChar = index => {
      for (let j = index; j >= 0; j--) {
        const ch = content[j]
        if (!isWhitespace(ch)) return ch
      }
      return null
    }

    const isAtStatementStart = index => {
      for (let j = index - 1; j >= 0; j--) {
        const ch = content[j]
        if (ch === '\n' || ch === '\r') return true
        if (ch !== ' ' && ch !== '\t' && ch !== '\f') return false
      }
      return true
    }

    const nextNonWsChar = index => {
      for (let j = index; j < content.length; j++) {
        const ch = content[j]
        if (!isWhitespace(ch)) return ch
      }
      return null
    }

    const result = []
    let i = 0

    let inSingleQuote = false
    let inDoubleQuote = false
    let inLineComment = false
    let inBlockComment = false
    let interpolationBraceBalance = 0

    while (i < content.length) {
      const ch = content[i]
      const next = content[i + 1]

      if (inLineComment) {
        result.push(ch)
        if (ch === '\n') inLineComment = false
        i++
        continue
      }

      if (inBlockComment) {
        result.push(ch)
        if (ch === '*' && next === '/') {
          result.push(next)
          i += 2
          inBlockComment = false
          continue
        }
        i++
        continue
      }

      if (inSingleQuote) {
        result.push(ch)
        if (ch === '\\' && next) {
          result.push(next)
          i += 2
          continue
        }
        if (ch === '\'') inSingleQuote = false
        i++
        continue
      }

      if (inDoubleQuote) {
        result.push(ch)
        if (ch === '\\' && next) {
          result.push(next)
          i += 2
          continue
        }
        if (ch === '"') inDoubleQuote = false
        i++
        continue
      }

      if (ch === '/' && next === '/') {
        result.push(ch, next)
        i += 2
        inLineComment = true
        continue
      }

      if (ch === '/' && next === '*') {
        result.push(ch, next)
        i += 2
        inBlockComment = true
        continue
      }

      if (ch === '\'') {
        result.push(ch)
        inSingleQuote = true
        i++
        continue
      }

      if (ch === '"') {
        result.push(ch)
        inDoubleQuote = true
        i++
        continue
      }

      if (ch === '#' && next === '{') {
        result.push(ch, next)
        interpolationBraceBalance++
        i += 2
        continue
      }

      if (interpolationBraceBalance > 0) {
        if (ch === '{') interpolationBraceBalance++
        if (ch === '}') interpolationBraceBalance--
      }

      if (ch === '$' && isIdentStart(next) && interpolationBraceBalance === 0) {
        let j = i + 1
        while (j < content.length && isIdent(content[j])) j++
        const varName = content.slice(i + 1, j)

        const atStatementStart = isAtStatementStart(i) || ['{', '}', ';', null].includes(prevNonWsChar(i - 1))
        const looksLikeDeclaration = atStatementStart && nextNonWsChar(j) === ':'

        if (!looksLikeDeclaration && targetVars.has(varName)) {
          result.push(`var(--${toKebabCase(varName)})`)
          i = j
          continue
        }

        result.push(content.slice(i, j))
        i = j
        continue
      }

      result.push(ch)
      i++
    }

    return result.join('')
  }

  try {
    const names = JSON.parse(readFileSync(duxapp))?.themeVarNames
    const targetVars = new Set(names)
    return function (source, resourcePath) {
      return replaceScssVars(source, targetVars, resourcePath || this?.resourcePath)
    }
  } catch (error) {
    console.log(`主题变量名读取失败`, error)
    return v => v
  }
})()
