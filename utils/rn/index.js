import { useLaunch as useLaunchWeapp, nextTick } from '@tarojs/taro'
import { useEffect, useRef } from 'react'

export const useLaunch = process.env.TARO_ENV === 'weapp'
  ? useLaunchWeapp
  : callback => {
    const data = useRef(callback)

    useEffect(() => {
      data.current?.()
    }, [])
  }

export const networkVerify = params => params

export const useBackHandler = () => { }

export {
  nextTick
}
