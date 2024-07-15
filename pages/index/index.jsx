import { View } from '@tarojs/components'
import { Header, ScrollView, TopView } from '@/duxapp'

import './index.scss'

export default function Duxapp() {

  return <TopView>
    <Header title='duxapp' titleCenter />
    <ScrollView>
      <View className='duxapp-demo__title'>欢迎使用duxapp</View>
      <View className='duxapp-demo__p'>添加模块: yarn duxapp app add app名称</View>
      <View className='duxapp-demo__p'>创建模块: yarn duxapp app create app名称</View>
    </ScrollView>
  </TopView>
}
