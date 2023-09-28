
const config = {
    /**
     * ios上传相关配置
     */
    ios: {
      // 项目目录 默认为 duxapp
      dirName: 'duxapp',
      // 应用商店上传账号
      account: '',
      // 不是账号密码，是在账户中心生成的密码
      password: '',
      // 创建证书等操作
      issuerId: '',
      keyId: '',
      keyPath: '',
      // 导出配置文件
      exportOptionsPlist: 'ExportOptions.plist'
    },
    /**
     * 热更新上传控制
     * 安卓和ios独立控制 设置common为公共参数
     * {
     *  token：账户设置中心生成的token
     *  account：上传的账号
     *  version：当前代码需要的原生app版本
     *  name：appcenter上的应用名称 不填写默认为package.json的 name + '-' + (ios或者android)
     * }
     */
    codePush: {
      common: {
        token: '',
        account: '',
        version: '^1.0.0'
      },
      android: {},
      ios: {}
    },
    qiniu: {
      accessKey: '',
      secretKey: '',
      bucket: '',
      cdn: ''
    }
  }

  module.exports = config
