import classNames from 'classnames'
import { ScrollView as TaroScrollView, View } from '@tarojs/components'
import { Horizontal } from './Horizontal'
import './index.scss'

export const ScrollView = ({
  style = {},
  refresh,
  scrollWithAnimation = true,
  className,
  flip = false,
  onRefresh,
  ...props
}) => {

  return <View className={classNames('scroll-root', className)} style={style}>
    <TaroScrollView
      type='list'
      scrollY
      className={classNames(
        'scroll-auto-height-weapp scroll',
        flip && 'scroll-flip'
      )}
      scrollWithAnimation={scrollWithAnimation}
      refresherEnabled={refresh !== undefined}
      refresherThreshold={50}
      onRefresherrefresh={() => {
        !refresh && onRefresh?.()
      }}
      refresherTriggered={!!refresh}
      refresherBackground='transparent'
      enhanced
      showScrollbar={false}
      {...props}
    />
  </View>
}

ScrollView.Horizontal = Horizontal
