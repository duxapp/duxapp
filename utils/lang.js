/* eslint-disable react-hooks/rules-of-hooks */
import { useMemo } from 'react'
import { getSystemInfoSync } from '@tarojs/taro'
import { ObjectManage } from './data'
import { QuickEvent } from './QuickEvent'
import { userConfig } from '../config/userConfig'

const isPlainObject = value => typeof value === 'object' && value !== null && !Array.isArray(value)

const deepMerge = (target, source) => {
  if (!isPlainObject(target) || !isPlainObject(source)) {
    return source
  }
  Object.keys(source).forEach(key => {
    const sourceValue = source[key]
    const targetValue = target[key]
    if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
      deepMerge(targetValue, sourceValue)
    } else {
      target[key] = sourceValue
    }
  })
  return target
}

const getByPath = (obj, path) => {
  if (!obj || !path) return
  if (!path.includes('.')) return obj[path]
  const keys = path.split('.')
  let current = obj
  for (let i = 0; i < keys.length; i++) {
    current = current?.[keys[i]]
    if (current == null) return
  }
  return current
}

const interpolate = (text, params) => {
  if (typeof text !== 'string' || !params) return text
  return text.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, name) => {
    const value = params[name]
    return value == null ? match : String(value)
  })
}

const normalizeModuleName = name => (name && typeof name === 'string' ? name : 'global')

const normalizeLang = value => {
  if (!value || typeof value !== 'string') return
  const raw = value.trim()
  if (!raw) return

  // 统一各种写法：
  // - zhHant / zhHans（驼峰） -> zh-hant / zh-hans
  // - zh_CN / zh-HK -> zh-cn / zh-hk
  const normalized = raw
    .replace(/_/g, '-')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()

  const parts = normalized.split('-')
  const primary = parts[0]
  const region = parts[1]

  if (primary === 'zh') {
    const hasHans = parts.includes('hans')
    const hasHant = parts.includes('hant')
    if (hasHans) return 'zh'
    if (hasHant) return 'zhHant'
    if (['tw', 'hk', 'mo'].includes(region)) return 'zhHant'
    return 'zh'
  }

  if (primary === 'en') return 'en'
  if (primary === 'ja' || primary === 'jp') return 'ja'
  if (primary === 'ko' || primary === 'kr') return 'ko'
  if (primary === 'ru') return 'ru'
  if (primary === 'fr') return 'fr'
  if (primary === 'de') return 'de'
  if (primary === 'es') return 'es'
  if (primary === 'pt') return 'pt'
  if (primary === 'it') return 'it'
  if (primary === 'ar') return 'ar'
  if (primary === 'th') return 'th'
  if (primary === 'vi') return 'vi'
  if (primary === 'id') return 'id'
  if (primary === 'ms') return 'ms'
  if (primary === 'tr') return 'tr'
  if (primary === 'hi') return 'hi'

  return primary
}

const LANG_NAMES = {
  zh: '简体中文',
  zhHant: '繁體中文',
  en: 'English',
  ja: '日本語',
  ko: '한국어',
  ru: 'Русский',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
  pt: 'Português',
  it: 'Italiano',
  ar: 'العربية',
  th: 'ไทย',
  vi: 'Tiếng Việt',
  id: 'Bahasa Indonesia',
  ms: 'Bahasa Melayu',
  tr: 'Türkçe',
  hi: 'हिन्दी'
}

const getLangName = value => LANG_NAMES[value] || value

class Lang extends ObjectManage {

  constructor() {
    super({
      cache: true,
      cacheKey: 'duxapp-lang',
      cacheSync: true,
      defaultData: {
        lang: null,
        version: 0
      }
    })

    const config = this.config = userConfig.option?.duxapp?.lang || {}

    config.default = normalizeLang(config.default) || 'zh'
    config.fallback = normalizeLang(config.fallback) || config.default || 'zh'
    config.autoDetect ??= false

    config.langs ||= []
    config.langs = config.langs.map(normalizeLang).filter(Boolean)
    if (!config.langs.length) {
      config.langs.push(config.default || config.fallback || 'zh')
    }
    config.langs = [...new Set(config.langs)]
    if (!config.langs.includes(config.default)) {
      config.langs.unshift(config.default)
    } else {
      config.langs = [config.default, ...config.langs.filter(v => v !== config.default)]
    }

    this.currentLang = config.default

    // 同步缓存读取结果后，更新 currentLang
    this.onSet((data, type) => {
      const next = data?.lang || config.default
      this.currentLang = next
      this.langEvent.trigger(next)

      // 首次使用：未保存语言时可按设备语言自动选择，并保存到本地
      if ((type === 'cache' || type === 'no-cache') && !data?.lang && config.autoDetect) {
        const deviceLang = this.getDeviceLang()
        if (deviceLang && config.langs?.includes(deviceLang)) {
          // 首次写入语言时无需预加载
          this.setLang(deviceLang, { preload: false })
        }
      }
    }, true, true)
  }

  config

  currentLang

  getDeviceLang() {
    try {
      const locale = getSystemInfoSync?.()?.language
      return normalizeLang(locale)
    } catch (e) {
      return
    }
  }

  /**
   * 资源结构：
   * modules[name] = {
   *   fallback: 'zh',
   *   resources: { zh: {...}, en: {...} },
   *   loaders: { zh: () => Promise<object>, en: () => Promise<object> },
   *   loading: { zh: Promise, en: Promise }
   * }
   */
  modules = {}

  langEvent = new QuickEvent()

  _bumpVersion() {
    this.merge(data => ({
      version: (data.version || 0) + 1
    }))
  }

  createModule(name, options = {}) {
    name = normalizeModuleName(name)
    const module = this.modules[name] ||= {
      fallback: options.fallback || this.config.fallback,
      resources: {},
      loaders: {},
      loading: {}
    }
    if (options.fallback) {
      module.fallback = options.fallback
    }
    if (options.resources) {
      Object.keys(options.resources).forEach(lang => {
        this.addResources(name, lang, options.resources[lang])
      })
    }
    if (options.loaders) {
      Object.keys(options.loaders).forEach(lang => {
        this.addLoader(name, lang, options.loaders[lang])
      })
    }
    return module
  }

  addResources(moduleName, lang, resources, { merge = true } = {}) {
    moduleName = normalizeModuleName(moduleName)
    if (!lang || !resources) return
    const module = this.createModule(moduleName)
    const target = module.resources[lang]
    if (merge && isPlainObject(target) && isPlainObject(resources)) {
      deepMerge(target, resources)
    } else if (merge && !target && isPlainObject(resources)) {
      module.resources[lang] = { ...resources }
    } else {
      module.resources[lang] = resources
    }
    this._bumpVersion()
  }

  addLoader(moduleName, lang, loader) {
    moduleName = normalizeModuleName(moduleName)
    if (!lang || typeof loader !== 'function') return
    const module = this.createModule(moduleName)
    module.loaders[lang] = loader
  }

  /**
   * 注册语言包：默认按“懒加载”处理（传函数则视为 loader）
   * @param {string} moduleName
   * @param {string} lang
   * @param {object|Function|Promise<object>} resourcesOrLoader
   * @param {{ eager?: boolean, merge?: boolean }} options
   */
  add(moduleName, lang, resourcesOrLoader, { eager = false, merge = true } = {}) {
    if (typeof resourcesOrLoader === 'function') {
      this.addLoader(moduleName, lang, resourcesOrLoader)
      eager && this.load(moduleName, lang).catch(() => null)
      return
    }
    if (resourcesOrLoader instanceof Promise) {
      this.addLoader(moduleName, lang, async () => resourcesOrLoader)
      eager && this.load(moduleName, lang).catch(() => null)
      return
    }
    this.addResources(moduleName, lang, resourcesOrLoader, { merge })
  }

  /**
   * 批量注册语言包/loader
   * @param {string} moduleName
   * @param {Record<string, any>} resourcesMap { zh: {...} | (()=>Promise), en: {...} | (()=>Promise) }
   * @param {{ eager?: boolean, merge?: boolean }} options
   */
  addMany(moduleName, resourcesMap, options) {
    if (!resourcesMap || typeof resourcesMap !== 'object') return
    Object.keys(resourcesMap).forEach(lang => {
      this.add(moduleName, lang, resourcesMap[lang], options)
    })
  }

  async load(moduleName, lang = this.getLang()) {
    moduleName = normalizeModuleName(moduleName)
    const module = this.createModule(moduleName)
    if (!lang) return
    if (module.resources?.[lang]) return module.resources[lang]

    const existing = module.loading?.[lang]
    if (existing) return existing

    const loader = module.loaders?.[lang]
    if (!loader) return

    const promise = (async () => {
      try {
        const result = await loader()
        const resources = result?.default ?? result
        if (resources) {
          this.addResources(moduleName, lang, resources, { merge: true })
        }
        return module.resources[lang]
      } finally {
        delete module.loading[lang]
      }
    })()

    module.loading[lang] = promise
    return promise
  }

  /**
   * 预加载指定语言（可限制模块列表）
   * @param {string} lang
   * @param {string[]} moduleNames
   */
  async preload(lang, moduleNames) {
    const names = moduleNames?.length ? moduleNames : Object.keys(this.modules)
    await Promise.all(names.map(name => this.load(name, lang).catch(() => null)))
  }

  getLang(saveLang) {
    if (saveLang) {
      return this.data.lang
    }
    return this.currentLang || this.data.lang || this.config.default
  }

  useLang(saveLang) {
    const data = this.useData()
    const value = saveLang
      ? data.lang
      : (this.currentLang || data.lang || this.config.default)
    return {
      value,
      name: getLangName(value)
    }
  }

  /**
   * 切换语言
   * @param {string} lang
   * @param {{ preload?: boolean, moduleNames?: string[] }} options
   */
  setLang(lang, { preload = true, moduleNames } = {}) {
    if (!lang || typeof lang !== 'string') return
    if (lang === this.data.lang && lang === this.currentLang) return
    this.currentLang = lang
    this.set({
      ...this.data,
      lang
    })
    preload && this.preload(lang, moduleNames)
  }

  /**
   * 获取翻译
   * @param {string} moduleName 模块名（独立命名空间）
   * @param {string} key 翻译key，支持 a.b.c
   * @param {any|object|{ defaultValue?: any, lang?: string, params?: object }} [paramsOrOptions] 默认值 / 插值参数 / 选项
   */
  t(moduleName, key, paramsOrOptions) {
    moduleName = normalizeModuleName(moduleName)
    if (!key) return

    let options
    let params
    if (isPlainObject(paramsOrOptions) && ('lang' in paramsOrOptions || 'params' in paramsOrOptions || 'defaultValue' in paramsOrOptions)) {
      options = paramsOrOptions
      params = options.params
    } else if (isPlainObject(paramsOrOptions)) {
      options = {}
      params = paramsOrOptions
    } else {
      options = { defaultValue: paramsOrOptions }
      params = undefined
    }

    const currentLang = options.lang || this.getLang()
    const module = this.modules[moduleName]
    // 当前语言资源未加载时，自动触发一次懒加载（t 仍然保持同步）
    if (currentLang && module && !module.resources?.[currentLang] && module.loaders?.[currentLang]) {
      this.load(moduleName, currentLang).catch(() => null)
    }
    const moduleFallback = module?.fallback
    const globalFallback = this.config.fallback

    const tryGet = langCode => {
      const dict = module?.resources?.[langCode]
      if (!dict) return
      return getByPath(dict, key)
    }

    let value = tryGet(currentLang)
    if (value == null && moduleFallback && moduleFallback !== currentLang) {
      value = tryGet(moduleFallback)
    }
    if (value == null && globalFallback && globalFallback !== currentLang && globalFallback !== moduleFallback) {
      value = tryGet(globalFallback)
    }
    const defaultValue = options?.defaultValue
    if (value == null) {
      value = defaultValue
    }
    if (value == null) {
      value = key
    }
    return interpolate(value, params)
  }

  /**
   * 获取绑定模块的 t 函数
   * @param {string} moduleName
   */
  getT(moduleName) {
    moduleName = normalizeModuleName(moduleName)
    return (key, paramsOrOptions) => this.t(moduleName, key, paramsOrOptions)
  }

  /**
   * 监听语言变化
   * @param {(lang: string) => void} callback
   * @param {{ onLast?: boolean }} options
   */
  onChange(callback, options) {
    return this.langEvent.on(callback, options?.onLast)
  }

  /**
   * 模块辅助：快速创建并注册语言包/loader
   * @param {string} moduleName
   * @param {{ fallback?: string }} options
   */
  module(moduleName, options) {
    moduleName = normalizeModuleName(moduleName)
    this.createModule(moduleName, options)
    return {
      add: (lang, resourcesOrLoader, config) => this.add(moduleName, lang, resourcesOrLoader, config),
      addMany: (resourcesMap, config) => this.addMany(moduleName, resourcesMap, config),
      addResources: (lang, resources, config) => this.addResources(moduleName, lang, resources, config),
      addLoader: (lang, loader) => this.addLoader(moduleName, lang, loader),
      load: (lang) => this.load(moduleName, lang),
      t: (key, paramsOrOptions) => this.t(moduleName, key, paramsOrOptions),
      getT: () => this.getT(moduleName),
      useT: () => this.useT(moduleName)
    }
  }

  useT(moduleName) {
    const { lang, version } = this.useData()
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMemo(() => {
      void lang
      void version
      return this.getT(moduleName)
    }, [moduleName, lang, version])
  }

  getLangs() {
    const langs = this.config.langs || []
    return langs.map(value => ({
      name: getLangName(value),
      value
    }))
  }

  useLangs() {
    this.useData('lang')
    return this.getLangs()
  }
}

export const lang = new Lang()

export const duxappLang = lang.module('duxapp')
