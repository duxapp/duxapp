import { getWindowInfo as taroGetWindowInfo } from '@tarojs/taro'

const getSafeAreaInsets = () => {
  if (typeof document === 'undefined' || !document.body) {
    return { top: 0, right: 0, bottom: 0, left: 0 }
  }

  const probe = document.createElement('div')
  probe.style.cssText = [
    'position: fixed',
    'top: 0',
    'left: 0',
    'width: 0',
    'height: 0',
    'padding: constant(safe-area-inset-top) constant(safe-area-inset-right) constant(safe-area-inset-bottom) constant(safe-area-inset-left)',
    'padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
    'visibility: hidden',
    'pointer-events: none',
  ].join(';')

  document.body.appendChild(probe)
  const styles = window.getComputedStyle(probe)
  const top = parseFloat(styles.paddingTop) || 0
  const right = parseFloat(styles.paddingRight) || 0
  const bottom = parseFloat(styles.paddingBottom) || 0
  const left = parseFloat(styles.paddingLeft) || 0
  document.body.removeChild(probe)

  return { top, right, bottom, left }
}

export const getWindowInfo = () => {
  const info = taroGetWindowInfo()
  const insets = getSafeAreaInsets()

  const screenWidth = Number.isFinite(info?.screenWidth)
    ? info.screenWidth
    : (Number.isFinite(info?.windowWidth) ? info.windowWidth : (typeof window !== 'undefined' ? window.innerWidth : 0))
  const screenHeight = Number.isFinite(info?.screenHeight)
    ? info.screenHeight
    : (Number.isFinite(info?.windowHeight) ? info.windowHeight : (typeof window !== 'undefined' ? window.innerHeight : 0))

  return {
    ...info,
    safeArea: {
      left: Math.max(0, insets.left),
      right: Math.max(0, screenWidth - insets.right),
      top: Math.max(0, insets.top),
      bottom: Math.max(0, screenHeight - insets.bottom),
      width: Math.max(0, screenWidth - insets.left - insets.right),
      height: Math.max(0, screenHeight - insets.top - insets.bottom),
    },
  }
}
