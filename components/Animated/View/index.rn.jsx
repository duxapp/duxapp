import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming
} from 'react-native-reanimated'
import ClickableSimplified from '@tarojs/components-rn/dist/components/ClickableSimplified'
import { deepCopy } from '@/duxapp/utils/object'

const ClickView = ClickableSimplified(Animated.View)

export const View = ({ animation, style = {}, ...props }) => {

  const [init, setInit] = useState(false)

  const lastStyle = useRef(deepCopy(style))

  const progress = useSharedValue(0)

  const finishTimerRef = useRef()

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
    if (type === 'transformOrigin') {
      return '50% 50% 0'
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
    if (type === 'backgroundColor') {
      return value
    }
    if (type.startsWith('rotate') || type.startsWith('skew')) {
      if (typeof value === 'number') {
        return value
      }
      if (typeof value === 'string') {
        const n = parseFloat(value)
        return Number.isFinite(n) ? n : 0
      }
      return 0
    }
    if ((type === 'translateX' || type === 'translateY') && typeof value === 'string') {
      const v = value.trim()
      if (v.endsWith('%')) {
        const n = parseFloat(v)
        if (!Number.isFinite(n)) {
          return 0
        }
        if (!init) {
          return 0
        }
        const base = type === 'translateX' ? lastStyle.current?.width : lastStyle.current?.height
        return Number.isFinite(base) ? (base * n / 100) : n
      }
    }
    if (typeof value === 'string') {
      const n = parseFloat(value)
      if (Number.isFinite(n) && (value.endsWith('px') || value.trim() === String(n))) {
        return n
      }
    }
    return value
  }, [init])

  const compiled = useMemo(() => {
    if (!animation?.length) {
      return null
    }

    const types = [...new Set(animation.map(group => Object.keys(group.action)).flat())]

    const inputRange = [0, ...animation.map((_, index) => index + 1)]

    const series = types.reduce((prev, type) => {
      const outputRange = [getValue(type, getDefaultValue(type))]
      animation.forEach(group => {
        const last = outputRange[outputRange.length - 1]
        outputRange.push(getValue(type, group.action[type] ?? last))
      })
      prev[type] = { inputRange, outputRange }
      return prev
    }, {})

    const baseTransform = lastStyle.current.transform ?? []
    const animatedTransformTypes = types.filter(type => transformProps.includes(type))
    const staticTransform = (baseTransform || []).filter(item => {
      const key = item && typeof item === 'object' ? Object.keys(item)[0] : null
      return !key || !animatedTransformTypes.includes(key)
    })

    const fallbackOrigin = getDefaultValue('transformOrigin')
    const transformOrigin = [
      ...animation.map(v => v.option?.transformOrigin ?? fallbackOrigin),
      animation[animation.length - 1].option?.transformOrigin ?? fallbackOrigin
    ]

    const finalState = types.reduce((prev, type) => {
      const out = series[type].outputRange
      prev[type] = out[out.length - 1]
      return prev
    }, {})

    return {
      len: animation.length,
      types,
      series,
      staticTransform,
      transformOrigin,
      finalState
    }
  }, [animation, getDefaultValue, getValue])

  const animatedStyle = useAnimatedStyle(() => {
    if (!compiled) {
      return {}
    }
    const { series, staticTransform, types, transformOrigin, len } = compiled
    const p = progress.value

    const res = {}

    const transform = staticTransform ? [...staticTransform] : []
    types.forEach(type => {
      const isTransform = transformProps.includes(type)
      if (isTransform) {
        const { inputRange, outputRange } = series[type]
        if (type.startsWith('rotate') || type.startsWith('skew')) {
          const deg = interpolate(p, inputRange, outputRange)
          transform.push({ [type]: `${deg}deg` })
        } else {
          const v = interpolate(p, inputRange, outputRange)
          transform.push({ [type]: v })
        }
        return
      }

      if (type === 'backgroundColor') {
        const { inputRange, outputRange } = series[type]
        res.backgroundColor = interpolateColor(p, inputRange, outputRange)
        return
      }

      const { inputRange, outputRange } = series[type]
      res[type] = interpolate(p, inputRange, outputRange)
    })

    if (transform.length) {
      res.transform = transform
    }

    if (transformOrigin?.length) {
      const idx = Math.min(Math.max(Math.floor(p), 0), len)
      res.transformOrigin = transformOrigin[idx] ?? transformOrigin[transformOrigin.length - 1]
    }

    return res
  }, [compiled])

  const commitFinalState = useCallback((finalState, staticTransform) => {
    lastStyle.current = applyFinalState(lastStyle.current, finalState, staticTransform)
  }, [])

  useLayoutEffect(() => {
    if (!compiled) {
      return
    }
    if (finishTimerRef.current) {
      clearTimeout(finishTimerRef.current)
      finishTimerRef.current = null
    }
    cancelAnimation(progress)
    progress.value = 0

    const steps = animation.map((group, index) => {
      const easing = (easings[group.option?.timingFunction] || easings.linear)()
      const timing = withTiming(index + 1, {
        duration: group.option?.duration,
        easing
      })

      const delay = group.option?.delay || 0
      return delay ? withDelay(delay, timing) : timing
    })

    progress.value = withSequence(...steps)

    const totalMs = animation.reduce((sum, group) => {
      const duration = Number(group.option?.duration) || 0
      const delay = Number(group.option?.delay) || 0
      return sum + duration + delay
    }, 0)
    finishTimerRef.current = setTimeout(() => {
      commitFinalState(compiled.finalState, compiled.staticTransform)
      finishTimerRef.current = null
    }, totalMs)

    return () => {
      if (finishTimerRef.current) {
        clearTimeout(finishTimerRef.current)
        finishTimerRef.current = null
      }
      cancelAnimation(progress)
    }
  }, [animation, commitFinalState, compiled, progress])

  const RenderView = props.onClick ? ClickView : Animated.View

  return <RenderView
    style={[
      style,
      animatedStyle
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

const easings = {
  linear: () => Easing.linear,
  ease: () => Easing.ease,
  'ease-in': () => Easing.in(Easing.ease),
  'ease-in-out': () => Easing.inOut(Easing.ease),
  'ease-out': () => Easing.out(Easing.ease),
  'step-start': () => Easing.step0,
  'step-end': () => Easing.step1
}

const applyFinalState = (prev, finalState, staticTransform = []) => {
  const next = { ...prev }
  const transform = [...(staticTransform || [])]

  Object.keys(finalState || {}).forEach(type => {
    const value = finalState[type]
    if (!transformProps.includes(type)) {
      next[type] = value
      return
    }
    transform.push({
      [type]: type.startsWith('rotate') || type.startsWith('skew')
        ? (typeof value === 'string' ? value : `${value}deg`)
        : value
    })
  })

  if (transform.length) {
    next.transform = transform
  }
  return next
}
