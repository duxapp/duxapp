import { View, Text } from '@tarojs/components'
import { Header, ScrollView, TopView } from '@/duxapp'
import './index.scss'

export default TopView.page(function Duxapp() {

  return <>
    <Header title='duxapp' titleCenter />
    <ScrollView>
      <View className='duxapp-index'>
        <Text className='duxapp-index__title'>欢迎使用 duxapp</Text>
        <Text className='duxapp-index__content'>duxapp是一个模块化跨端开发框架，查看文档获取更多框架使用方法</Text>
        <Text className='duxapp-index__content'>添加模块: yarn duxapp app add app名称</Text>
        <Text className='duxapp-index__content'>创建模块: yarn duxapp app create app名称</Text>
        <Text className='duxapp-index__content'>开发文档: http://duxapp.com</Text>
      </View>
    </ScrollView>
  </>
})
