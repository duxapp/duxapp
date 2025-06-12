/**
 * login:是否需要登录
 * platform:支持的平台(weapp, h5, rn)不配置支持所有
 * subPackage:是否将其设置为分包
 * home: 是否是主页 是主页的页面将会被排在前面
 */
export default  {
  // 指定页面路径
  path: 'pages',
  // 跳转时打印跳转路径
  pages: {
    'duxapp/index': {
      pages: {
        index: {}
      }
    },
    'duxapp/webview': {
      pages: {
        index: {}
      }
    }
  }
}
