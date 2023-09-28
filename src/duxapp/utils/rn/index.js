import Taro, { useLaunch as useLaunchWeapp } from '@tarojs/taro'
import { useEffect, useRef } from 'react'
import { noop } from '../util'

const asyncNoop = async () => { }

export const getStatusBarHeight = () => {

  return Taro.getSystemInfoSync().statusBarHeight
}
export const wechatInit = asyncNoop
export const codePushHigh = app => app
export const systemUploadApp = asyncNoop
export const compare = () => false
export const updateApp = asyncNoop
export const startHide = noop
export const duxPushInit = () => ({
  callback: noop,
  remove: noop
})
export const crequestMultiplePermission = asyncNoop

export const isWXAppInstalled = asyncNoop
export const sendAuthRequest = asyncNoop
export const Platform = noop
export const RNShare = noop
export const RNFS = noop


export const useLaunch = process.env.TARO_ENV === 'weapp'
  ? useLaunchWeapp
  : callback => {
    const data = useRef(callback)

    useEffect(() => {
      data.current?.()
    }, [])
  }

export const networkVerify = async params => params
