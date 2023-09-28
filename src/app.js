import { useDidHide, useDidShow } from '@tarojs/taro'
import { useEffect } from 'react'
import { effect, launch, show, hide } from './init'
import { codePushHigh, useLaunch } from './duxapp/utils/rn'

import './app.scss'

const App = codePushHigh(props => {

  useEffect(effect, [])

  useLaunch(launch)

  useDidShow(show)

  useDidHide(hide)

  return <>
    {props.children}
  </>
})

export default App
