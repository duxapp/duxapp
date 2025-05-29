import { loadFontFace } from '@tarojs/taro'
import { Current } from '@tarojs/runtime'
import fs from '@ohos.file.fs'

export const loadFont = (name, url) => {
  return loadFontFace({
    global: true,
    family: name,
    source: `url("${url}")`,
    scopes: ['webview', 'native']
  })
}

let currentContext

const registerFontFamily = () => {
  const resourceMgr = currentContext.resourceManager
  const sandboxDir = currentContext.filesDir

  fonts.forEach(icon => {
    const urls = icon.url.split('/')
    const name = urls[urls.length - 1]
    try {
      const fontPath = `${sandboxDir}/${name}`
      const bf = resourceMgr.getMediaByNameSync(name.replace('.ttf', ''))
      const file = fs.openSync(fontPath, fs.OpenMode.CREATE | fs.OpenMode.READ_WRITE)
      fs.writeSync(file.fd, bf.buffer)
      fs.closeSync(file.fd)
      Current.nativeModule.registerFontFamily({
        [icon.name]: fontPath
      })
    } catch (err) {
      console.error(`字体注册失败 ${name}: ${err.message}`)
    }
  })
  fonts.splice(0, fonts.length)
}

Current.contextPromise.then(context => {
  currentContext = context
  registerFontFamily()
  return context
})

const fonts = []

export const loadLocalFont = (name, url) => {
  fonts.push({ name, url })
  if (currentContext) {
    registerFontFamily()
  }
}
