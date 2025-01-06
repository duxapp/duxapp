import { View, Text } from '@tarojs/components'
import { Header, ScrollView, TopView } from '@/duxapp'

export default TopView.HOC(function Duxapp() {

  return <>
    <Header title='duxapp' titleCenter />
    <ScrollView>
      <View className='gap-4 p-3'>
        <Text className='text-c1 text-s5 bold text-center'>欢迎使用 duxapp</Text>
        <Text className='text-c1 text-s3'>duxapp是一个模块化跨端开发框架，查看文档获取更多框架使用方法</Text>
        <Text className='text-c2 text-s3'>添加模块: yarn duxapp app add app名称</Text>
        <Text className='text-c2 text-s3'>创建模块: yarn duxapp app create app名称</Text>
        <Text className='text-c2 text-s3'>开发文档: http://duxapp.com</Text>
      </View>
    </ScrollView>
  </>
})
