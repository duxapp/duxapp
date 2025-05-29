import { View, ScrollView } from '@tarojs/components'
import classNames from 'classnames'
import './index.scss'

export const Horizontal = ({ children, className, style, ...props }) => {

  return <ScrollView
    showsVerticalScrollIndicator={false}
    showsHorizontalScrollIndicator={false}
    enhanced
    showScrollbar={false}
    {...props}
    style={style}
    className='scroll-view-horizontal-scroll'
    scrollX
    scrollY={false}
  >
    <View className={classNames('scroll-view-horizontal', className)}>
      {children}
    </View>
  </ScrollView>
}
