import { View, Text } from '@tarojs/components'
import { currentPage, duxappLang, transformStyle } from '@/duxapp/utils'
import { TopView } from '../TopView'
import { Loading } from '../Loading'

import './index.scss'

const ShowLoading = ({
  text = duxappLang.t('common.loading'),
  mask
}) => {

  return <>
    {mask && <View className='ShowLoading__mask' />}
    <View className='ShowLoading' style={{
      transform: transformStyle({
        translateX: '-50%',
        translateY: '-50%'
      })
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
