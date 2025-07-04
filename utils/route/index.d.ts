interface AnyObject {
  [key: string]: any
}

interface RouteConfig extends AnyObject {
  /**
   * 页面是否需要登录
   */
  login?: boolean
  /**
   * 是否为首页
   */
  home?: boolean
  /**
   * 编译的平台
   */
  platform?: ('h5' | 'weapp' | 'rn' | 'harmony_cpp')[]

}

interface RouteParams {
  /**
   * 跳转路径
   * 如: duxapp/pages/webview/index
   */
  path: string
  /**
   * 完成的跳转路径，包含参数
   */
  url: string
  /**
   * 跳转类型
   */
  type: 'navigateTo' | 'redirectTo' | 'navigateBack' | 'reLaunch'
  /**
   * 路由参数
   */
  params: AnyObject
}

interface Route {
  /**
   * 通用路由跳转方法，需参考文档使用
   * https://duxapp.com/docs/duxapp/utils/route#navpath-params
   * @param url 字符串格式的路径 支持多种协议跳转
   * @param data 传递给下一个页面的数据
   * 仅当普通页面跳转才会返回 backData，用于接收下一个页面返回的数据
   */
  nav: (url: string, data?: AnyObject) => Promise<{
    backData: () => Promise<{
      [key: string]: any
    }>
  }>

  /**
   * 获取路由参数的hook
   */
  useRoute: () => {
    /**
     * 当前路径
     */
    path: string
    /**
     * 当前参数
     */
    params: AnyObject
  }

  /**
   * 打开新页面
   * @param url
   * @param data
   */
  push: (url: string, data?: AnyObject) => Promise<{
    backData: () => Promise<{
      [key: string]: any
    }>
  }>

  /**
   * 重定向打开新页面，当前页面将被关闭
   * @param url
   * @param data
   */
  redirect: (url: string, data?: AnyObject) => Promise<{}>

  /**
   * 返回页面
   * @param num 需要关闭的页面数量，默认为1，如果传入 'home' 可以强制返回路由中指定的首页
   * @param data 需要传递给上一个页面的参数，配合页面跳转使用
   */
  back: (num?: number | 'home', data?: AnyObject) => Promise<{}>

  /**
   * 重启程序
   */
  relaunch: () => void

  /**
   * 打开拨号盘
   * @param tel 要拨打的电话号码
   */
  tel: (tel: string) => void

  /**
   * 打开小程序 APP端项目需要包含wechat模块（H5端不能使用）
   * @param option 小程序选项
   */
  mini: (option: {
    /**
     * 小程序APPID
     * 小程序端使用
     */
    appid?: string
    /**
     * 小程序原始id
     * RN端使用
     */
    userName?: string
    /**
     * 要打开小程序的页面
     */
    path?: string
    /**
     * 小程序版本
     * 0正式版 1开发版 2体验版
     */
    type?: 0 | 1 | 2
    /**
     * 传递给小程序的参数
     */
    query: AnyObject
  }) => void

  /**
   * 打开一个位置
   * 小程序启动内置地图
   * H5端如果注册了jssdk也会启动微信地图，否则启动一个网页打开位置
   * APP端会启动手机上的百度或者高德APP
   * 使用的是火星坐标系坐标（高德地图用的坐标系）
   * @param option 地图参数
   */
  mapPoint: (option: {
    /**
     * 经度
     */
    longitude: number
    /**
     * 维度
     */
    latitude: number
    /**
     * 位置名称
     */
    name: string
    /**
     * 位置地址
     */
    address: string
  }) => void

  /**
   * 监听路由跳转，可以用于拦截跳转，类似于路由守卫的功能
   * 如果抛出Promise错误将停止跳转
   * @param callback 异步回调函数
   */
  onNavBefore: (callback: (config: RouteConfig, option: RouteParams) => Promise<any>) => void

  /**
   * 监听路由跳转完成
   * @param callback 回调函数
   */
  onNavAfter: (callback: (option: RouteParams) => void) => void
}

export const route: Route

/**
 * 所有路由列表
 */
export const pages: {
  [key: string]: RouteConfig
}

/**
 * 路由配置原始数据
 */
export const routes: {
  [key: string]: {
    path?: string
    pages: {
      [key: string]: RouteConfig
    }
  }
}

/**
 * 同步获取当前页面路径
 */
export const currentPage: () => string

/**
 * 异步获取当前页面路径
 */
export const currentPageAsync: () => Promise<string>
