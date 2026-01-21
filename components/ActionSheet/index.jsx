import { useRef } from 'react'
import { View, Text } from '@tarojs/components'
import classNames from 'classnames'
import { duxappLang, getWindowInfo } from '@/duxapp/utils'
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

    const center = getWindowInfo().windowWidth >= 600

    const t = duxappLang.useT()

    return <>
      <PullView onClose={onClose} side={center ? 'center' : 'bottom'} ref={pullView}>
        <View className='ActionSheet'
          style={center ? { width: 360 } : {}}
        >
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
	            <Text className='ActionSheet__item__text'>{t('common.cancel')}</Text>
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
	            reject(duxappLang.t('common.cancelSelect'))
	            action.remove()
	          }
	        }
	      ])
    })
  }
  return ActionSheet_
})()
