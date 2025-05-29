import { useCallback, useRef } from 'react'
import { View, Text } from '@tarojs/components'
import { TopView } from '../TopView'
import { PullView } from '../PullView'
import './index.scss'

export const ActionSheet = ({
  title = '请选择',
  list,
  onSelect,
  onClose
}) => {

  const pullView = useRef()

  const itemClick = useCallback((item, index) => {
    setTimeout(() => {
      onSelect?.({
        item,
        index
      })
    }, 200)
    pullView.current.close()
  }, [onSelect])

  const close = useCallback(() => {
    onClose?.()
  }, [onClose])

  return <>
    <PullView onClose={close} ref={pullView}>
      <View className='rt-3 bg-white'>
        <View className='ActionSheet__title'>{title}</View>
        {
          list?.map((item, index) => <View key={item}
            className='ActionSheet__item'
            onClick={itemClick.bind(null, item, index)}
          >
            <Text className='ActionSheet__item__text'>{item}</Text>
          </View>)
        }
      </View>
    </PullView>
  </>
}

ActionSheet.show = ({
  title = '提示',
  list = [],
} = {}) => {
  return new Promise((resolve, reject) => {
    const action = TopView.add([
      ActionSheet,
      {
        title,
        list,
        onSelect: event => {
          resolve(event)
          action.remove()
        },
        onClose: () => {
          reject('取消选择')
          action.remove()
        }
      }
    ])
  })
}
