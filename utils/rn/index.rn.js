import { Platform, BackHandler } from 'react-native'
import { getStorage, setStorage, request } from '@tarojs/taro'
import { useEffect, useRef } from 'react'
import { asyncTimeOut } from '../util'

const createAsyncNoRepeat = () => {
  const callbacks = []
  return {
    run: calback => {
      if (!callbacks.length) {
        calback().then(() => {
          callbacks.forEach(v => v[0]())
          callbacks.splice(0)
        }).catch(err => {
          callbacks.forEach(v => v[1](err))
          callbacks.splice(0)
        })
      }
      return new Promise((resolve, reject) => {
        callbacks.push([resolve, reject])
      })
    }
  }
}

/**
 * 验证ios端是否获得了网络请求权限
 * 因为ios app首次在手机上安装刚启动时请求会失败，需要做个验证，等待有网络之后再发起请求
 */
export const networkVerify = (() => {
  let status = false
  const noRepeat = createAsyncNoRepeat()
  return async params => {
    if (Platform.OS === 'ios') {
      if (status) {
        return params
      }
      await noRepeat.run(async () => {
        try {
          const res = await getStorage({ key: 'ios-request-verify' })
          if (res?.data) {
            status = true
            return params
          }
          throw '未获取本地信息'
        } catch (error) {
          // 去 递归验证
          const verify = async (level = 0) => {
            if (level > 120) {
              throw { message: '等待时间过长(超过30s) 请求失败' }
            }
            try {
              const baidu = await request({
                url: 'https://www.baidu.com'
              })
              if (baidu.statusCode !== 200) {
                throw '请求未成功'
              }
            } catch (error1) {
              if (error1?.statusCode !== 200) {
                await asyncTimeOut(200)
                await verify(level + 1)
              }
            }
          }
          await verify()
          await setStorage({ key: 'ios-request-verify', data: '1' })
        }
      })
      status = true
      return params
    } else {
      return params
    }
  }
})()

export const useLaunch = callback => {

  const data = useRef(callback)

  useEffect(() => {
    data.current?.()
  }, [])
}

export const nextTick = callback => setTimeout(callback, 0)

export const useBackHandler = (callback, status = true) => {

  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (status) {
      const event = BackHandler.addEventListener('hardwareBackPress', () => {
        callbackRef.current?.()
        return true
      })
      return () => event.remove()
    }
  }, [status])
}


