import { getSystemInfoSync } from '@tarojs/taro'

export const getDeviceInfo = () => {
  return getSystemInfoSync()
}
