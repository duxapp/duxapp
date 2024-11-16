import { View, ScrollView } from '@tarojs/components'
import classNames from 'classnames'
import { useState } from 'react'
import { Layout } from '../../Layout'
import './index.scss'

export const Horizontal = ({ children, className, style, ...props }) => {

  if (process.env.TARO_ENV === 'harmony') {
    return <HarmonyHorizontal className={className || ''} style={style} {...props}>{children}</HarmonyHorizontal>
  }

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

const HarmonyHorizontal = ({ children, className, style, ...props }) => {

  const [height, setHeight] = useState(style?.height || 0)

  if (!height && !style?.height) {
    return <View className='overflow-hidden'>
      <Layout className='flex-row absolute left-0 top-0'
        onLayout={e => setHeight(e.height)}
      >
        {children}
      </Layout>
    </View>
  }

  return <ScrollView
    showsVerticalScrollIndicator={false}
    showsHorizontalScrollIndicator={false}
    enhanced
    showScrollbar={false}
    {...props}
    style={{ height, ...style }}
    className={className}
    scrollX
    scrollY={false}
  >
    {children}
  </ScrollView>
}
