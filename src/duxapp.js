const config = {
  // 对于默认不开启的页面 配置在此处将开启这些页面
  openPages: [

  ],
  // 不需要的页面可以配置路径禁用
  disablePages: [

  ],
  // 覆盖app.config.js 配置
  appConfig: {
    requiredPrivateInfos: [
      'chooseLocation',
      'getLocation',
      'onLocationChange',
      'startLocationUpdateBackground',
      'chooseAddress'
    ]
  },
  // 调试配置
  debug: {
    // 在h5端开启vconsole调试功能
    vconsole: false
  },
  // 模块配置 将会调用模块生命周期的option，将对应模块的参数传入
  option: {
    // 基础模块
    duxapp: {
      // app端配置
      app: {
        wxAppid: '',
        wxUniversalLink: '',
        codePushAndroidKey: '',
        codePushAndroidTestKey: '',
        codePushIosKey: '',
        codePushIosTestKey: '',
        duxPushID: '',
        umAppKey: ''
      },
      theme: {
        primaryColor: '#CDDE00',
        secondaryColor: '#FDD000',
        successColor: '#34a853',
        warningColor: '#fbbc05',
        dangerColor: '#ea4335',
        pageColor: '#fafbf8',
        mutedColor: '#666',
        header: {
          color: '#fff', // 仅支持rgb hex值，请勿使用纯单词 设置为数组将显示一个渐变按钮
          textColor: '#000', // 文本颜色
          showWechat: false, // 微信公众号是否显示header
          showWap: true, // h5是否显示header
        }
      },
      /**
       * 如果某些字体放在本地，则配置此处，可以对不同系统配置，也可以统一配置
       */
      font: {
        local: {
          // SlimIcon: {
          //   ios: true
          //   adnroid: true
          // }
        }
      }
    },
  }
}

export default config
