import Taro from '@tarojs/taro'

export const loadFont = (name, url) => {
  return Taro.loadFontFace({
    global: true,
    family: name,
    source: `url("${url}")`,
    scopes: ['webview', 'native']
  })
}
