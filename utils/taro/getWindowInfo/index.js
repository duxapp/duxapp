import { getSystemInfoSync } from '@tarojs/taro'

export const getWindowInfo = () => {
  return getSystemInfoSync()
}
