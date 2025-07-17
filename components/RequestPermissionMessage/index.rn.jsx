import { Text, View } from '@tarojs/components'
import { Platform, PermissionsAndroid } from 'react-native'
import { asyncTimeOut, getWindowInfo, px, userConfig } from '@/duxapp/utils'
import { TopView } from '../TopView'

/**
 * 申请安卓文件读取权限
 * @returns
 */
export const requestPermissionMessage = async (type, msg) => {
  if (Platform.OS === 'android' && type?.permission?.length) {
    const check = async () => {
      const res = await Promise.all(type.permission.map(PermissionsAndroid.check))
      if (res.some(v => !v)) {
        return true
      }
    }
    if (await check()) {
      const { remove } = TopView.add([
        Message,
        {
          type,
          msg
        }
      ])
      await asyncTimeOut(300)
      if (await check()) {
        setTimeout(remove, 4000)
      } else {
        remove()
      }
    }
  }
}

const Message = ({ msg, type }) => {
  const permissions = userConfig.option?.duxappReactNative?.permissions || {}
  const { statusBarHeight = 0 } = getWindowInfo()
  return <View
    className='absolute gap-1 p-3 r-2 z-1 bg-primary'
    style={{
      top: statusBarHeight + 10,
      left: px(32),
      right: px(32)
    }}
  >
    <Text className='text-s4 Text-bold text-c4'>{type.name}权限使用说明</Text>
    <Text className='text-s2 text-c4'>{msg || permissions[type.type] || type.message}</Text>
  </View>
}

requestPermissionMessage.types = {
  camera: {
    type: 'camera',
    name: '相机',
    message: '用于更换头像、反馈问题拍照等用途',
    permission: [PermissionsAndroid.PERMISSIONS.CAMERA]
  },
  audio: {
    type: 'audio',
    name: '麦克风',
    message: '用户录制音频内容供系统使用',
    permission: [PermissionsAndroid.PERMISSIONS.RECORD_AUDIO]
  },
  image: {
    type: 'image',
    name: '相机或相册',
    message: '用于更换头像、反馈问题拍照等用途',
    permission: [PermissionsAndroid.PERMISSIONS.CAMERA, 'android.permission.READ_MEDIA_IMAGES']
  },
  video: {
    type: 'video',
    name: '相机或相册',
    message: '用于更换头像、反馈问题录制等用途',
    permission: [PermissionsAndroid.PERMISSIONS.CAMERA, 'android.permission.READ_MEDIA_VIDEO']
  },
  location: {
    type: 'location',
    name: '位置信息',
    message: '用于定位您的位置，展示附近推荐',
    permission: [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION]
  },
  saveMedia: {
    type: 'saveMedia',
    name: '相册写入',
    message: '用于保存用户头像，推广海报等用途',
    permission: [PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES, PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO]
  }
}
