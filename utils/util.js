import Taro, { pxTransform } from '@tarojs/taro'

export const toast = msg => {
  if (!msg) {
    return
  }
  Taro.showToast({
    title: typeof msg === 'object' ? JSON.stringify(msg) : msg,
    icon: 'none'
  })
}

let systemInfo
export const isIphoneX = () => {
  systemInfo = systemInfo || Taro.getSystemInfoSync()
  if (process.env.TARO_ENV === 'rn') {
    return require('react-native').Platform.OS !== 'android' && systemInfo.safeArea?.bottom < systemInfo.screenHeight
  } else {
    const phoneMarks = ['iPhone X', 'iPhone 11', 'iPhone 12', 'iPhone 13', 'iPhone 14', 'iPhone 15']
    const { model = '' } = systemInfo
    for (let i = 0, l = phoneMarks.length; i < l; i++) {
      if ((model || '').startsWith(phoneMarks[i])) return true
    }
    return false
  }
}

export const asyncTimeOut = time => {
  let resolveFunc
  let rejectFunc
  const pro = new Promise((resolve, reject) => {
    resolveFunc = resolve
    rejectFunc = reject
  })
  const timer = setTimeout(() => resolveFunc({ code: 200, message: '倒计时结束', type: 'timeout' }), time)
  pro.clear = () => {
    clearTimeout(timer)
    rejectFunc({ code: 500, message: '清除倒计时' })
  }
  return pro
}

export const noop = () => { }

/**
 * 获取Platform类型，主要用于支付请求的时候获取不同的支付类型
 * @returns {string} app APP端 | weapp 微信小程序 | wechat 微信公众号 | wap h5端
 */
export const getPlatform = () => {
  switch (process.env.TARO_ENV) {
    case 'rn':
      return 'app'
    case 'h5':
      const ua = window.navigator.userAgent.toLowerCase()
      if (ua.match(/MicroMessenger/i) == 'micromessenger') {
        return 'wechat'
      } else {
        return 'wap'
      }
    default:
      return process.env.TARO_ENV
  }
}

export const stopPropagation = e => {
  e?.stopPropagation?.()
}

export const px = (() => {
  const cache = {}
  return val => {
    if (!cache[val]) {
      cache[val] = pxTransform(val)
    }
    return cache[val]
  }
})();