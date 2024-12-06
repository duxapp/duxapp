import { isValidElement, cloneElement, forwardRef, useState, useEffect, useRef, useImperativeHandle, useCallback } from 'react'
import { View } from '@tarojs/components'
import { asyncTimeOut, nextTick, pxNum } from '@/duxapp/utils'
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
  modal, mask = modal
}, ref) => {

  const [mainAn, setMainAn] = useState(Animated.defaultState)

  const [maskAn, setMaskAn] = useState(Animated.defaultState)

  const an = useRef(null)

  const refs = useRef({})
  refs.current.onClose = onClose
  refs.current.overlayOpacity = overlayOpacity

  const translate = siteTranslates[side]

  const close = useCallback(async () => {
    setMainAn(an.current[translate.key](pxNum(translate.value)).opacity(0).step().export())
    setMaskAn(an.current.opacity(0).step().export())
    await asyncTimeOut(200)
    refs.current.onClose?.()
  }, [translate.key, translate.value])

  useImperativeHandle(ref, () => {
    return {
      close
    }
  })

  useEffect(() => {
    nextTick(() => {
      if (!an.current) {
        an.current = Animated.create({
          duration: 200
        })
      }
      setMainAn(an.current.translateY(0).opacity(1).step().export())
      setMaskAn(an.current.opacity(refs.current.overlayOpacity).step().export())
    })
  }, [])

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
      style={style}
    >
      {
        isValidElement(children) ?
          cloneElement(children, {
            style: {
              ...children.props.style,
              ...side === 'bottom' || side === 'top' ? { width: '100%' } : { height: '100%' }
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
  right: { key: 'translateX', value: 200 }
}
