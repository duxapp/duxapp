const isObject = value => typeof value === 'object' && !Array.isArray(value)

/**
 * 设置模块的theme
 * @param {*} userConfig
 * @param {*} config
 */
export const setAppTheme = (userConfig, config) => {
  Object.keys(userConfig).forEach(key => {
    const value = config[key]
    const userValue = userConfig[key]
    if (isObject(value) && isObject(userValue)) {
      setAppTheme(userValue, value)
    } else if (!isObject(value)) {
      config[key] = userValue
    }
  })
}
