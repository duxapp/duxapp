import Taro from '@tarojs/taro'
import { getStatusBarHeight } from './rn'
import { getPlatform } from './util'

(() => {
  let systemInfo
  // 系统信息
  global.systemInfo = new Proxy({}, {
    get(obj, prop) {
      if (!systemInfo) {
        systemInfo = Taro.getSystemInfoSync()
      }
      if (prop === 'statusBarHeight') {
        return getStatusBarHeight()
      }
      return systemInfo[prop]
    }
  })
  // 平台信息
  global.platform = getPlatform()
})()
