import { getSystemInfoSync } from '@tarojs/taro'
import { getPlatform } from './util'

(() => {
  let systemInfo
  // 系统信息
  global.systemInfo = new Proxy({}, {
    get(obj, prop) {
      if (!systemInfo) {
        systemInfo = getSystemInfoSync()
      }
      return systemInfo[prop]
    }
  })
  // 平台信息
  global.platform = getPlatform()
})()
