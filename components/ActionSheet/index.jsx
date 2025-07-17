import { useRef } from 'react'
import { View, Text } from '@tarojs/components'
import classNames from 'classnames'
import { TopView } from '../TopView'
import { PullView } from '../PullView'
import './index.scss'

export const ActionSheet = /*@__PURE__*/ (() => {
  const ActionSheet_ = ({
    title,
    list,
    onSelect,
    onClose
  }) => {

    const pullView = useRef()

    const itemClick = async (item, index) => {
      await pullView.current.close(false)
      onSelect({
        item,
        index
      })
    }

    return <>
      <PullView onClose={onClose} ref={pullView}>
        <View className='ActionSheet'>
          {!!title && <View className='ActionSheet__title'>{title}</View>}
          {
            list?.map((item, index) => <View key={index}
              className={classNames('ActionSheet__item', !index && 'ActionSheet__item--line')}
              onClick={() => itemClick(item, index)}
            >
              <Text className='ActionSheet__item__text'>{item}</Text>
            </View>)
          }
          <View
            className='ActionSheet__item ActionSheet__item--cancel'
            onClick={() => pullView.current.close()}
          >
            <Text className='ActionSheet__item__text'>取消</Text>
          </View>
        </View>
      </PullView>
    </>
  }

  ActionSheet_.show = ({
    title,
    list = [],
  } = {}) => {
    return new Promise((resolve, reject) => {
      const action = TopView.add([
        ActionSheet_,
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
  return ActionSheet_
})()
