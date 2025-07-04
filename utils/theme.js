import { useMemo } from 'react'
import { ObjectManage } from './data'
import { themeUtil } from './rn/util'
import { userConfig } from '../config/userConfig'
import { deepCopy } from './object'

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
      cacheKey: 'duxapp-theme',
      cacheSync: true,
      defaultData: {
        mode: null
      }
    })
    const config = this.config = userConfig.option?.duxapp?.themeConfig || {}
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
    const isAuto = this.isAuto = config.themes[config.light] && config.themes[config.dark]

    const switchMode = this.switchMode = mode => {
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

          const appTheme = this.appThemes[app]
          if (theme && appTheme) {
            if (this.copyThemes[app]) {
              setAppTheme(this.copyThemes[app], appTheme)
            } else {
              this.copyThemes[app] = deepCopy(appTheme)
            }
            setAppTheme(defaultTheme, appTheme)
            mode !== config.default && setAppTheme(theme, appTheme)
          }
        })
      }
    }
    if (this.isSetMode) {
      this.onSet(data => {
        let mode = data?.mode
        if (!mode && isAuto) {
          mode = config[themeUtil.getTheme()]
        }
        if (!mode) {
          mode = config.default
        }
        if (!this.appThemes) {
          this.waitAppThemes = mode
        } else {
          switchMode(mode)
        }
      }, true, true)
      isAuto && themeUtil.onThemeChange(res => {
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

  isSetMode = !['harmony_cpp'].includes(process.env.TARO_ENV)

  // 将系统默认主题配置深度拷贝一份的备份，用于保存一些默认配置
  copyThemes = {}

  registerAppThemes(themes) {
    this.appThemes = themes
    if (!this.isSetMode) {
      this.switchMode(this.config.default)
    } else if (this.waitAppThemes) {
      this.switchMode(this.waitAppThemes)
      this.waitAppThemes = null
    }
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

  isDark(mode = this.data.mode) {
    if (!mode) {
      return this.currentMode === this.config.dark
    }
    return mode === this.config.dark
  }

  useIsDark(mode) {
    this.useData()
    return this.isDark(mode)
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
        this.currentMode = this.config[themeUtil.getTheme()]
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

  // fix 提供给RN端使用
  useMemo = useMemo
}

export const theme = new Theme()
