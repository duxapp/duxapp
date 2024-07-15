import { useCallback, useEffect, useRef, forwardRef, useImperativeHandle, useMemo } from 'react'
import { View } from '@tarojs/components'
import { Animated, BackHandler } from 'react-native'
import { Absolute } from '../Absolute'
import './index.scss'

export const PullView = forwardRef(({
  side = 'bottom',
  modal,
  mask = modal,
  masking = true,
  duration = 200,
  onClose,
  style,
  overlayOpacity = 0.5,
  group,
  children
}, ref) => {

  const pullAnim = useRef(new Animated.Value(0)).current

  const stylePosition = useMemo(() => {
    const position = {}
    // RN端动画
    switch (side) {
      case 'left':
        position.top = 0
        position.bottom = 0
        position.left = 0
        break
      case 'right':
        position.top = 0
        position.bottom = 0
        position.right = 0
        break
      case 'top':
        position.left = 0
        position.right = 0
        position.top = 0
        break
      case 'bottom':
        position.left = 0
        position.right = 0
        position.bottom = 0
        break
    }
    return position
  }, [side])

  useEffect(() => {
    setTimeout(() => {
      Animated.timing(
        pullAnim,
        {
          toValue: 1,
          duration,
          useNativeDriver: true
        }
      ).start()
    }, 20)
  }, [duration, pullAnim])

  const close = useCallback(() => {
    Animated.timing(
      pullAnim,
      {
        toValue: 0,
        duration: duration,
        useNativeDriver: true
      }
    ).start()
    onClose && setTimeout(onClose, duration)
  }, [duration, onClose, pullAnim])

  const overlayCilck = useCallback(() => {
    if (mask) return
    close()
  }, [close, mask])

  const overlayCilckRef = useRef(overlayCilck)
  overlayCilckRef.current = overlayCilck

  useEffect(() => {
    const event = BackHandler.addEventListener('hardwareBackPress', () => {
      overlayCilckRef.current()
      return true
    })
    return () => event.remove()
  }, [])

  useImperativeHandle(ref, () => {
    return {
      close
    }
  }, [close])

  const translate = siteTranslates[side]

  return <Absolute group={group}>
    {masking && <Animated.View
      className='PullView'
      style={{
        backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
        opacity: pullAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1]
        })
      }}
    >
      <View className='PullView__other' onClick={overlayCilck}></View>
    </Animated.View>}
    <Animated.View
      className='PullView__main'
      style={[
        stylePosition,
        style,
        {
          opacity: pullAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1]
          }),
          [translate.key]: pullAnim.interpolate({
            inputRange: [0, 1],
            outputRange: translate.outputRange
          })
        }
      ]}
    >
      {children}
    </Animated.View>
  </Absolute>
})

const siteTranslates = {
  top: { key: 'translateY', outputRange: [-200, 0] },
  bottom: { key: 'translateY', outputRange: [200, 0] },
  left: { key: 'translateX', outputRange: [-200, 0] },
  right: { key: 'translateX', outputRange: [200, 0] }
}
