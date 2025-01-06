type PermissionMessageItem = {
  type: 'camera' | 'audio' | 'image' | 'video' | 'location' | 'saveMedia' | string,
  name: string,
  message: string,
  permission: string[]
}

type RequestPermissionMessage = (
  type: PermissionMessageItem,
  message?: string
) => Promise<{}>

/**
 * APP用这个方法发起权限请求，能将权限使用说明显示在APP上
 * 部分应用市场上架APP，要求提示用户权限使用说明
 */
export const requestPermissionMessage: RequestPermissionMessage & {
  types: {
    camera: PermissionMessageItem
    audio: PermissionMessageItem
    image: PermissionMessageItem
    video: PermissionMessageItem
    location: PermissionMessageItem
    saveMedia: PermissionMessageItem
  }
}
