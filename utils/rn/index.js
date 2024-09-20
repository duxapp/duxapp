import { useLaunch as useLaunchWeapp } from '@tarojs/taro'
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
