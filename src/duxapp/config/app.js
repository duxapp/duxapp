import { userConfig } from './userConfig'

/**
 * 应用配置
 */
export default {
  /**
   * 开放平台app的APPID
   * 用于微信登录支付等功能
   * @example wxa3830f282b1dd554
   */
  wxAppid: '',
  /**
   * UniversalLink
   * 用于IOS端微信的登录验证，未配置会导致ios端APP无法微信登录
   * 需要在服务器上放置一个一个验证文件 百度搜UniversalLink
   * @example https://www.xiannvh.com/app/
   */
  wxUniversalLink: '',
  /**
   * App Android端 热更新codepush Key
   * 下面4个key值在项目初始化的时候创建，安装运行 codepush-init-android 和 codepush-init-ios 分别获得安卓和ios的发布和测试key，总共4个
   * 运行上面两个命令之前需要正确配置package.json里面的name和codePushAccount两个字段，
   * name是项目名称用作唯一标识，codePushAccount是你当前的账户 通过 appcenter profile list 命令获得的 Username 字段
   */
  codePushAndroidKey: '',
  /**
   * 测试分支key
   */
  codePushAndroidTestKey: '',
  /**
   * App IOS端 热更新codepush Key
   */
  codePushIosKey: '',
  /**
   * 测试分支key
   */
  codePushIosTestKey: '',

  /**
   * 推送appid
   */
  duxPushID: '',
  /**
   * 友盟推送appKey 仅在ios端使用
   */
  umAppKey: '',
  ...userConfig.option.duxapp?.app
}
