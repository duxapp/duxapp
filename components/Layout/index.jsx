import { useEffect, useMemo } from 'react'
import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import { CustomWrapper } from '../CustomWrapper'

export const getRect = (select, getAll, scope, num = 0) => {
  const query = scope ? Taro.createSelectorQuery().in(scope) : Taro.createSelectorQuery()

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
    if (id) {
      getRect('.' + currentClass, false, document.getElementById(id)?.ctx).then(onLayout)
    } else {
      getRect('.' + currentClass).then(onLayout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentClass, reloadKey, id])

  return <View className={`${className} ${currentClass}`} {...props}>
    {children}
  </View>
}
