import { pxTransform, showToast } from '@tarojs/taro'
import { getDeviceInfo, getWindowInfo } from './taro'
import duxappTheme from '../config/theme'

export const toast = msg => {
  if (!msg) {
    return
  }
  showToast({
    title: typeof msg === 'object' ? JSON.stringify(msg) : msg,
    icon: 'none',
    duration: 3000
  })
}

const getBottomSafeAreaHeightFromInfo = () => {
  const info = getWindowInfo()
  const screenHeight = typeof info?.screenHeight === 'number'
    ? info.screenHeight
    : (typeof info?.windowHeight === 'number' ? info.windowHeight : NaN)
  const safeAreaBottom = typeof info?.safeArea?.bottom === 'number' ? info.safeArea.bottom : NaN

  if (!Number.isFinite(screenHeight) || !Number.isFinite(safeAreaBottom)) {
    return 0
  }

  return Math.max(0, screenHeight - safeAreaBottom)
}

/**
 * 获取底部安全区域高度（屏幕底部不可用的那部分，例如 iPhone 刘海屏的 home indicator 区域）
 */
export const getBottomSafeAreaHeight = () => {
  return getBottomSafeAreaHeightFromInfo()
}

export const isIphoneX = () => {
  return getBottomSafeAreaHeightFromInfo() > 0
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

export const px = (val, pxUnit) => {
  if (process.env.TARO_ENV === 'rn') {
    return pxTransform(val) + (pxUnit ? 'px' : 0)
  } else {
    return pxTransform(val)
  }
}

export const pxNum = val => {
  if (!pxNum.max) {
    let max = 525
    if (process.env.TARO_ENV === 'weapp') {
      let config = duxappTheme.topView?.weappRem

      if (config) {
        config = {
          maxSize: 28,
          maxSizePhone: 22,
          ...config,
        }
        const maxFontSize = isDesktop({ includeIPad: true }) ? config.maxSize : config.maxSizePhone
        // 对齐 `PageMeta` 中的计算：size = 40 * screenWidth / 750，然后 clamp 到 maxFontSize
        // 因此将换算宽度上限转换为 screenWidth 的上限：screenWidth = maxFontSize * 750 / 40
        if (typeof maxFontSize === 'number' && Number.isFinite(maxFontSize) && maxFontSize > 0) {
          max = maxFontSize * 750 / 40
        }
      }
    }
    pxNum.max = max
  }
  return val / 750 * Math.min(getWindowInfo().windowWidth, pxNum.max)
}

export const isDesktop = (options) => {
  const includeIPad = typeof options === 'boolean' ? options : !!options?.includeIPad

  if (!isDesktop.deviceInfo) {
    isDesktop.deviceInfo = getDeviceInfo()
  }

  const platform = String(isDesktop.deviceInfo.platform || '').toLowerCase()

  if (platform === 'windows' || platform === 'mac' || platform === 'ohos_pc') {
    return true
  }

  const model = String(isDesktop.deviceInfo.model || '')
  if (includeIPad && /ipad/i.test(model)) {
    return true
  }

  return false
}

export const transformStyle = obj => {
  if (process.env.TARO_ENV === 'rn') {
    return Object.keys(obj).map(key => {
      return {
        [key]: obj[key]
      }
    })
  }
  return Object.keys(obj).map(key => `${key}(${obj[key]})`).join(' ')
}

export const isPlatformMini = process.env.TARO_PLATFORM === 'mini'

/**
 * 增强版节流函数
 * @param {Function} fn 需要节流的函数
 * @param {number} delay 节流时间间隔(毫秒)
 * @param {boolean} [immediate=true] 是否立即执行第一次调用
 * @return {Function} 节流后的函数
 */
export const throttle = (fn, delay, immediate = true) => {
  let lastExecTime = 0
  let timer = null
  let pendingArgs = null
  let context = null

  const execute = () => {
    lastExecTime = Date.now()
    fn.apply(context, pendingArgs)
    timer = null
    pendingArgs = null
    context = null
  }

  return function (...args) {
    const now = Date.now()
    const elapsed = now - lastExecTime

    context = this
    pendingArgs = args

    // 清除之前的延迟执行
    if (timer) {
      clearTimeout(timer)
      timer = null
    }

    // 如果是第一次调用且设置立即执行
    if (immediate && lastExecTime === 0) {
      execute()
      return
    }

    // 如果距离上次执行已超过delay，立即执行
    if (elapsed > delay) {
      execute()
    }
    // 否则设置延迟执行(保证最后一次调用会被执行)
    else {
      timer = setTimeout(execute, delay - elapsed)
    }
  }
}
