import { useEffect, useRef } from 'react'
import { createSelectorQuery } from '@tarojs/taro'
import { View } from '@tarojs/components'

export const getRect = (select, getAll, scope, num = 0) => {
  const query = scope ? createSelectorQuery().in(scope) : createSelectorQuery()

  return new Promise((resolve, reject) => {
    if (num > 10) {
      reject('请求超过10次')
      return
    }
    let isRes = false
    query[getAll ? 'selectAll' : 'select'](select).boundingClientRect(res => {
      if (isRes) {
        return
      }
      isRes = true
      if ((!Array.isArray(res) && res) || Array.isArray(res) && res.length > 0) {
        resolve(res)
      } else {
        setTimeout(() => getRect(select, getAll, scope, num + 1).then(resolve).catch(reject), 5)
      }
    }).exec()
  })
}

/**
 * 获取组件的布局尺寸信息 H5端获取相对最近的TopView的位置
 * @returns
 */
export const Layout = ({ children, onLayout, reloadKey, ...props }) => {

  const view = useRef()

  // 计算出距离最近的TopView的位置

  const onLayoutRef = useRef(onLayout)
  onLayoutRef.current = onLayout

  useEffect(() => {
    // 找到TopView
    let topview = view.current.offsetParent
    while (!(topview.tagName === 'BODY' || topview.classList.contains('TopView'))) {
      topview = topview.offsetParent
    }
    const topviewRect = topview.getBoundingClientRect()
    const currentRect = view.current.getBoundingClientRect()
    onLayoutRef.current?.({
      width: currentRect.width,
      height: currentRect.height,
      x: currentRect.x - topviewRect.x,
      y: currentRect.y - topviewRect.y,
      left: currentRect.left - topviewRect.left,
      top: currentRect.top - topviewRect.top
    })
  }, [reloadKey])

  return <View ref={view} {...props}>
    {children}
  </View>
}
