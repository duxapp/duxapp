import { loadFontFace } from '@tarojs/taro'

export const loadFont = (name, url) => {
  return loadFontFace({
    global: true,
    family: name,
    source: `url("${url}")`,
    scopes: ['webview', 'native']
  })
}

export const loadLocalFont = () => {

}
