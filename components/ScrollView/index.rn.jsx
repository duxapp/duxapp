import { View, ScrollView as TaroScrollView } from '@tarojs/components'
import { RefreshControl } from 'react-native'
import { Horizontal } from './Horizontal'
import './index.scss'

export const ScrollView = ({
  style = {},
  refresh = false,
  scrollWithAnimation = true,
  flip = false,
  flatListParams,
  onRefresh,
  ...props
}) => {

  const scroll = <TaroScrollView
    nestedScrollEnabled
    scrollY
    {...onRefresh ? {
      refreshControl: <RefreshControl
        refreshing={refresh}
        onRefresh={onRefresh}
        colors={['rgb(217, 51, 58)']}
      />
    } : {}}
    {...flatListParams}
    style={{ height: 1, ...style }}
    scrollWithAnimation={scrollWithAnimation}
    scrollIndicatorInsets={{ right: 1 }}
    // WebView组件在滚动视图中 安卓部分机型闪退 添加如下属性
    overScrollMode='never'
    // 表单优化
    keyboardDismissMode='on-drag'
    keyboardShouldPersistTaps='handled'
    {...props}
  />

  if (!flip) {
    return scroll
  }

  return <View style={{ flex: 1, transform: flip ? [{ rotate: '180deg' }] : [] }} >
    {scroll}
  </View>
}

ScrollView.Horizontal = Horizontal
