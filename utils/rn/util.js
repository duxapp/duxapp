import { onThemeChange, getSystemInfoSync } from '@tarojs/taro'

export const Platform = {}
export const PermissionsAndroid = {}
export const ExpoFS = {}
export const ExpoImagePicker = {}
export const Keyboard = {}

export const themeUtil = {
  onThemeChange,
  setTheme: () => null,
  getTheme: () => getSystemInfoSync().theme || 'light'
}
