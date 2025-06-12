import { useEffect, useRef, useState, forwardRef } from 'react'
import { View as NativeView } from 'react-native'
import { getWindowInfo } from '@/duxapp/utils'
import ClickableSimplified from '@tarojs/components-rn/dist/components/ClickableSimplified'

const ClickView = ClickableSimplified(NativeView)

const View = forwardRef(({
  onClick,
  ...props
}, ref) => {
  if (onClick) {
    return <ClickView ref={ref} onClick={onClick} {...props} />
  }
  return <NativeView ref={ref} {...props} />
})

export const Layout = ({ children, onLayout, onClick, reloadKey, ...props }) => {

  const viewRef = useRef(null)

  /** 记录layout的值 measure有奇怪的bug当使用循环时，只能取得第一个实体节点的数据 */
  const layoutData = useRef({})

  const onLayoutRef = useRef(onLayout)
  onLayoutRef.current = onLayout

  const [layoutStatus, setLayoutStatus] = useState(false)

  useEffect(() => {
    if (viewRef.current && layoutStatus) {
      viewRef.current.measure((x, y, width, height, left, top) => {
        const { windowWidth } = getWindowInfo()
        onLayoutRef.current?.({
          width: width || layoutData.current.width,
          height: height || layoutData.current.height,
          x: x || layoutData.current.x,
          y: y || layoutData.current.y,
          /**
           * fix: 奇怪的bug 升级RN和Taro版本后 返回的pageX参数多了一个屏幕的宽度
           * 需要测试多个机型是否正常
           * 目前测试ios取值正常，安卓有此问题
           */
          left: left > windowWidth ? left - windowWidth : left,
          top
        })
      })
    }
  }, [reloadKey, layoutStatus])

  return <View
    {...props}
    onLayout={e => {
      layoutData.current = e.nativeEvent.layout
      setLayoutStatus(true)
    }}
    ref={viewRef}
    activeOpacity={1}
    {...onClick ? { onClick } : {}}
  >
    {children}
  </View>
}
