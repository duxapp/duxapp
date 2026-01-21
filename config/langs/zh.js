export default {
  common: {
    loading: '请稍后',
    cancel: '取消',
    cancelSelect: '取消选择'
  },
  request: {
    notInit: '数据未初始化',
    loadEnd: '数据已经加载完成',
    loading: '请稍后 正在加载中'
  },
  media: {
    source: {
      album: '相册',
      camera: '相机',
      photo: '拍照',
      video: '录像'
    },
    perm: {
      albumDenied: '申请相册权限被拒绝',
      cameraDenied: '申请摄像头权限被拒绝'
    },
    error: {
      invalidData: '错误数据：{{data}}'
    }
  },
  permission: {
    tipTitle: '{{name}}权限使用说明',
    camera: {
      name: '相机',
      message: '用于更换头像、反馈问题拍照等用途'
    },
    audio: {
      name: '麦克风',
      message: '用户录制音频内容供系统使用'
    },
    image: {
      name: '相机或相册',
      message: '用于更换头像、反馈问题拍照等用途'
    },
    video: {
      name: '相机或相册',
      message: '用于更换头像、反馈问题录制等用途'
    },
    location: {
      name: '位置信息',
      message: '用于定位您的位置，展示附近推荐'
    },
    saveMedia: {
      name: '相册写入',
      message: '用于保存用户头像，推广海报等用途'
    }
  },
  font: {
    loadFail: '{{name}} 字体加载失败，请确认网络环境，重启后重试'
  },
  map: {
    provider: {
      amap: '高德地图',
      baidu: '百度地图'
    },
    toast: {
      noApp: '没有合适的地图APP'
    },
    nav: {
      needDestination: '需要终点经纬度',
      needDestinationName: '需要传终点名称或者经纬度',
      openSuccess: '打开成功',
      noAmap: '暂无安装高德地图',
      noBaidu: '暂无安装百度地图'
    },
    location: {
      rnNotSupported: 'RN端不支持获取定位',
      failed: '获取定位失败'
    }
  }
}
