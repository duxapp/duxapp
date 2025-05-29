import { useEffect, useMemo } from 'react'
import { createSelectorQuery, nextTick } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { CustomWrapper } from '../CustomWrapper'

export const getRect = (select, getAll, scope, num = 0) => {
  const query = scope ? createSelectorQuery().in(scope) : createSelectorQuery()

  return new Promise((resolve, reject) => {
    if (num > 10) {
      reject('请求超过10次')
      return
    }
    query[getAll ? 'selectAll' : 'select'](select).boundingClientRect().exec(res => {
      if (Array.isArray(res) && res[0]) {
        resolve(getAll ? res : res[0])
      } else {
        setTimeout(() => getRect(select, getAll, scope, num + 1).then(resolve).catch(reject), 5)
      }
    })
  })
}

let layoutKey = 1
/**
 * 获取组件的布局尺寸信息
 * @param {*} param0
 * @returns
 */
export const Layout = ({ children, onLayout, className, reloadKey, ...props }) => {

  const { id } = CustomWrapper.useContext()

  const currentClass = useMemo(() => `ui-layout-measure-${++layoutKey}`, [])

  useEffect(() => {
    nextTick(() => {
      if (id) {
        getRect('.' + currentClass, false, document.getElementById(id)?.ctx).then(onLayout)
      } else {
        getRect('.' + currentClass).then(onLayout)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentClass, reloadKey, id])

  return <View className={`${className} ${currentClass}`} {...props}>
    {children}
  </View>
}
