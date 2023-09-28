import {
  app,
  route,
  startHide,
  // react-native-wechat-lib start
  wechatInit
  // react-native-wechat-lib end
} from './utils'

// react-native-wechat-lib start
// 让配置生效之后再执行微信初始化
setTimeout(wechatInit, 0)
// react-native-wechat-lib end

app.register('duxapp')

// 在启动的时候就隐藏启动屏 用来看到具体的报错
// startHide()

export const appLifecycle = {
  option: option => {

  },
  launch: () => {
    // route.init()
  },
  show: (...arg) => {
    route.showInit(...arg)
  },
  hide: () => { },
  effect: async () => {
    startHide()
  }
}
