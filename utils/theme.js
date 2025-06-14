import { onThemeChange, getSystemInfoSync } from '@tarojs/taro'
import { ObjectManage } from './data'
import { userConfig } from '../config/userConfig'

const isObject = value => typeof value === 'object' && !Array.isArray(value)

/**
 * 设置模块的theme
 * @param {*} newConfig
 * @param {*} config
 */
const setAppTheme = (newConfig, config) => {
  Object.keys(newConfig).forEach(key => {
    const value = config[key]
    const userValue = newConfig[key]
    if (isObject(value) && isObject(userValue)) {
      setAppTheme(userValue, value)
    } else if (!isObject(value)) {
      config[key] = userValue
    }
  })
}

class Theme extends ObjectManage {

  constructor() {
    super({
      cache: true,
      cacheKey: 'duxapp-theme'
    })
    const config = userConfig.option?.duxapp?.themeConfig || {}
    config.light ||= 'light'
    config.dark ||= 'dark'
    config.default ||= 'light'

    config.themes ||= {
      light: {
        name: '默认主题',
        color: '#fff'
      }
    }
    // 是否支持自动切换
    const isAuto = config.themes[config.light] && config.themes[config.dark]

    this.config = config
    this.isAuto = isAuto

    const switchMode = mode => {
      this.currentMode = mode
      const option = userConfig.option
      if (option) {
        Object.keys(option).forEach(app => {
          const item = option[app]
          const themes = {
            ...item.themes
          }
          if (item.theme && !themes.light) {
            themes.light = item.theme
          }

          const defaultTheme = themes[config.default]
          const theme = themes[mode]


          if (theme && this.appThemes[app]) {
            setAppTheme(defaultTheme, this.appThemes[app])
            mode !== config.default && setAppTheme(theme, this.appThemes[app])
          }
        })
      }
    }
    if (this.isSetMode) {
      this.quickEvent.on(data => {
        let mode = data?.mode
        if (!mode && isAuto) {
          mode = config[getSystemInfoSync().theme]
        }
        if (!mode) {
          mode = config.default
        }
        switchMode(mode)
      })
      isAuto && onThemeChange(res => {
        if (!this.data.mode) {
          switchMode(config[res.theme])
          this.set({
            ...this.data,
            mode: null
          })
        }
      })
    }
  }

  data = {
    mode: null
  }

  isSetMode = !['rn', 'harmony_cpp'].includes(process.env.TARO_ENV)

  registerAppThemes(themes) {
    this.appThemes = themes
  }

  useModes() {
    const modes = Object.keys(this.config.themes).map(mode => {
      return {
        mode,
        switch: () => this.setMode(mode),
        ...this.config.themes[mode]
      }
    })
    if (this.isAuto) {
      modes.unshift({
        mode: null,
        switch: () => this.setMode(null),
        name: '跟随系统'
      })
    }
    return modes
  }

  useMode(saveMode) {
    const data = this.useData()

    if (saveMode) {
      return data.mode
    }

    return this.currentMode
  }

  setMode(mode) {
    if (!this.isSetMode) {
      console.log('当前平台不支持切换主题')
      return
    }
    if (mode && !(mode in this.config.themes)) {
      console.log(`无效的主题：${mode}`)
      return
    }
    if (!mode) {
      if (this.isAuto) {
        this.currentMode = this.config[getSystemInfoSync().theme]
      } else {
        this.currentMode = this.config.default
      }
    }
    this.set({
      ...this.data,
      mode
    })
  }

  useTheme(app) {
    this.useData()
    return app ? this.appThemes[app] : this.appThemes
  }
}

export const theme = new Theme()
