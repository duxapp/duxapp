import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Animated, Easing } from 'react-native'
import ClickableSimplified from '@tarojs/components-rn/dist/components/ClickableSimplified'
import { deepCopy } from '@/duxapp/utils/object'

const ClickView = ClickableSimplified(Animated.View)

export const View = ({ animation, style = {}, ...props }) => {

  const [init, setInit] = useState(false)

  const lastStyle = useRef(deepCopy(style))

  const getDefaultValue = useCallback(type => {
    const val = type in lastStyle.current
      ? lastStyle.current[type]
      : transformProps.includes(type)
        ? lastStyle.current.transform?.find(v => typeof v[type] !== 'undefined')?.[type]
        : undefined

    if (typeof val !== 'undefined') {
      return val
    }
    if (type === 'backgroundColor') {
      return 'transparent'
    }
    if (type.startsWith('scale') || type === 'opacity') {
      return 1
    }
    if (type.startsWith('rotate') || type.startsWith('skew')) {
      return '0deg'
    }
    return 0
  }, [])

  const getValue = useCallback((type, value) => {
    if ((type.startsWith('rotate') || type.startsWith('skew')) && typeof value === 'number') {
      return `${value}deg`
    }
    return value
  }, [])

  const result = useMemo(() => {
    if (!animation?.length || !init) {
      return {
        style: {}
      }
    }
    const value = new Animated.Value(0)

    // 当前动画
    let an

    const types = [...new Set(animation.map(group => Object.keys(group.action)).flat())]

    const action = types.reduce((prev, type) => {
      if (!prev[type]) {
        prev[type] = {
          inputRange: [0],
          outputRange: [getDefaultValue(type)]
        }
      }
      animation.forEach((group, index) => {
        prev[type].inputRange.push(index + 1)

        const outputRange = prev[type].outputRange
        outputRange.push(getValue(type, group.action[type] ?? outputRange[outputRange.length - 1]))
      })
      return prev
    }, {})

    // 用来移除事件监听
    const events = []
    Object.keys(action).forEach(type => {
      action[type] = value.interpolate(action[type])
      action[type].addListener(e => {
        // 将最新的值更新到最后的值中
        if (!transformProps.includes(type)) {
          lastStyle.current[type] = e.value
        } else {
          if (!lastStyle.current.transform) {
            lastStyle.current.transform = []
          }
          let item = lastStyle.current.transform.find(v => typeof v[type] !== 'undefined')
          if (!item) {
            item = {
              [type]: 0
            }
            lastStyle.current.transform.push(item)
          }
          item[type] = e.value
        }
      })
      events.push(action[type])
      if (transformProps.includes(type)) {
        if (!action.transform) {
          action.transform = [...(lastStyle.current.transform ?? [])]
        }
        const i = action.transform.findIndex(v => typeof v[type] !== 'undefined')
        if (~i) {
          action.transform.splice(i, 1)
        }
        action.transform.push({
          [type]: action[type]
        })
        delete action[type]
      }
    })

    // 变换原点
    action.transformOrigin = value.interpolate({
      inputRange: [...animation.map((v, i) => i), animation.length],
      outputRange: [...animation.map(v => v.option.transformOrigin), animation[animation.length - 1].option.transformOrigin],
      easing: Easing.step1
    })

    return {
      style: action,
      start: () => {
        an = Animated.sequence(animation.map((group, index) => {
          return Animated.timing(value, {
            toValue: index + 1,
            duration: group.option.duration,
            easing: (easings[group.option.timingFunction] || easings.linear)(),
            delay: group.option.delay,
            useNativeDriver: isNativeDriver(group.action)
          })
        }))
        an.start()
      },
      stop: () => {
        an?.stop()
        events.forEach(v => v.removeAllListeners())
      }
    }
  }, [animation, getDefaultValue, getValue, init])

  useEffect(() => {
    result.start?.()
    return () => {
      result.stop?.()
    }
  }, [result])

  const RenderView = props.onClick ? ClickView : Animated.View

  return <RenderView
    style={[
      style,
      result.style
    ]}
    onLayout={e => {
      if (!init) {
        setInit(true)
      }
      lastStyle.current = {
        ...lastStyle.current,
        width: e.nativeEvent.layout.width,
        height: e.nativeEvent.layout.height
      }
    }}
    {...props}
  />
}

const transformProps = [
  'translate', 'translateX', 'translateY',
  'scale', 'scaleX', 'scaleY',
  'rotate', 'rotateX', 'rotateY', 'rotateZ',
  'skew', 'skewX', 'skewY'
]

const isNativeDriver = arr => Object.keys(arr).every(item => transformProps.includes(item.type) || item.type === 'opacity')

const easings = {
  linear: () => Easing.linear,
  ease: () => Easing.ease,
  'ease-in': () => Easing.in(Easing.ease),
  'ease-in-out': () => Easing.inOut(Easing.ease),
  'ease-out': () => Easing.out(Easing.ease),
  'step-start': () => Easing.step0,
  'step-end': () => Easing.step1
}
