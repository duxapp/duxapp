import { Platform, PermissionsAndroid, Keyboard, Appearance } from 'react-native'
import * as ExpoImagePicker from 'expo-image-picker'
import * as ExpoFS from 'expo-file-system'

export {
  Platform,
  PermissionsAndroid,
  ExpoImagePicker,
  ExpoFS,
  Keyboard
}

export const themeUtil = {
  onThemeChange: callback => {
    return Appearance.addChangeListener(({ colorScheme }) => {
      callback({
        theme: colorScheme || 'light'
      })
    })
  },
  setTheme(colorScheme) {
    Appearance.setColorScheme(colorScheme)
  },
  getTheme: () => Appearance.getColorScheme() || 'light'
}
