import { isValidElement, cloneElement, forwardRef, useState, useEffect, useRef, useImperativeHandle, useCallback } from 'react'
import { View } from '@tarojs/components'
import { asyncTimeOut, nextTick, px, pxNum, transformStyle, useBackHandler } from '@/duxapp/utils'
import { Absolute } from '../Absolute'
import { Animated } from '../Animated'
import './index.scss'

export const PullView = forwardRef(({
  side = 'bottom',
  style,
  overlayOpacity = 0.5,
  children,
  masking = true,
  group,
  onClose,
  modal,
  mask = modal,
  duration = 200
}, ref) => {

  const [mainAn, setMainAn] = useState(Animated.defaultState)

  const [maskAn, setMaskAn] = useState(Animated.defaultState)

  const ans = useRef()

  const refs = useRef({})
  refs.current.onClose = onClose
  refs.current.overlayOpacity = overlayOpacity

  const translate = siteTranslates[side]

  const close = useCallback(async (change = true) => {
    let an = ans.current.main
    if (side === 'center' && process.env.TARO_ENV !== 'rn') {
      an = an.translate('-50%', '-50%')
    }
    setMainAn(an[translate.key](pxNum(translate.value)).opacity(0).step().export())
    setMaskAn(ans.current.mask.opacity(0).step().export())
    await asyncTimeOut(duration)
    change !== false && refs.current.onClose?.()
  }, [duration, side, translate.key, translate.value])

  useBackHandler(close, !mask)

  useImperativeHandle(ref, () => {
    return {
      close
    }
  })

  useEffect(() => {
    nextTick(() => {
      if (!ans.current) {
        ans.current = {
          main: Animated.create({
            duration,
            timingFunction: 'ease-in-out'
          }),
          mask: Animated.create({
            duration,
            timingFunction: 'ease-in-out'
          })
        }
      }
      if (side === 'center') {
        let an = ans.current.main.opacity(1)
        if (process.env.TARO_ENV !== 'rn') {
          an = an.translate('-50%', '-50%')
        }
        setMainAn(an.scale(1).step().export())
      } else {
        setMainAn(ans.current.main.translate(0, 0).opacity(1).step().export())
      }
      setMaskAn(ans.current.mask.opacity(refs.current.overlayOpacity).step().export())
    })
  }, [duration, side])

  return <Absolute group={group}>
    {masking && <Animated.View
      animation={maskAn}
      className='PullView'
    >
      <View className='PullView__other'
        onClick={() => {
          if (mask) {
            return
          }
          close()
        }}
      ></View>
    </Animated.View>}
    <Animated.View
      animation={mainAn}
      className={`PullView__main PullView__main--${side}`}
      style={{
        ...style,
        transform: transformStyle(side === 'center' ? {
          translateX: '-50%',
          translateY: '-50%',
          scaleX: 0.8,
          scaleY: 0.8
        } : {
          [translate.key]: px(translate.value)
        })
      }}
    >
      {
        isValidElement(children) ?
          cloneElement(children, {
            style: {
              ...children.props.style,
              ...(side === 'center'
                ? {}
                : side === 'bottom' || side === 'top'
                  ? { width: '100%' }
                  : { height: '100%' })
            }
          }) :
          children
      }
    </Animated.View>
  </Absolute>
})

const siteTranslates = {
  top: { key: 'translateY', value: -200 },
  bottom: { key: 'translateY', value: 200 },
  left: { key: 'translateX', value: -200 },
  right: { key: 'translateX', value: 200 },
  center: { key: 'scale', value: 0.8 }
}
