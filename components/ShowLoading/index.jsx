import { View, Text } from '@tarojs/components'
import { px, currentPage, getWindowInfo } from '@/duxapp/utils'
import { TopView } from '../TopView'
import { Loading } from '../Loading'

import './index.scss'

const getSize = size => {
  const { windowWidth } = getWindowInfo()
  return 750 / windowWidth * size
}

const ShowLoading = ({
  text = '请稍后',
  mask
}) => {
  const { windowWidth, windowHeight } = getWindowInfo()

  return <>
    {mask && <View className='ShowLoading__mask' />}
    <View className='ShowLoading' style={{
      left: px(getSize(windowWidth) / 2 - 100),
      top: px(getSize(windowHeight) / 2 - 100),
    }}
    >
      <Loading color='blank' size={64} />
      <Text className='ShowLoading__text'>{text}</Text>
    </View>
  </>
}

/**
 * 在页面上显示一个loading 当页面被关闭是loading也会随着关闭
 * @param {string} text loading文字
 * @param {boolean} mask 是否显示遮罩
 * @returns
 */
export const loading = (() => {
  const pages = {}
  return (text, mask) => {
    const page = currentPage()
    if (!pages[page]) {
      pages[page] = TopView.add([ShowLoading, { text, mask }])
    } else {
      pages[page].update([ShowLoading, { text, mask }])
    }
    return () => {
      /**
       * bug 停止的时候有时候找不到数据
       */
      pages[page]?.remove?.()
      delete pages[page]
    }
  }
})();
