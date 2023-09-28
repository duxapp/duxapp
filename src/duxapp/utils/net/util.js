import Taro from '@tarojs/taro'
import qs from 'qs'
import { recursionGetValue } from '../object'

let ExpoImagePicker, ExpoCamera, RNFS, Platform
if (process.env.TARO_ENV === 'rn') {
  ExpoImagePicker = require('expo-image-picker')
  RNFS = require('react-native-fs')
  Platform = require('react-native').Platform
  ExpoCamera = require('expo-camera')
}

/**
 * 获取请求url
 * @param {string} url api
 * @param {object} data 要加在url上的get参数
 * @param {object} params 请求参数
 * @return {string} 完整请求url
 */
const getUrl = (url, data = {}, params = {}) => {
  const { request } = params.config

  if (url.indexOf('http://') === -1 && url.indexOf('https://') === -1) {
    let urls = []
    if (process.env.NODE_ENV === 'production' && process.env.TARO_ENV === 'h5' && !!window.REQUEST_ORIGIN) {
      // 使用本地域名
      urls.push(window.REQUEST_ORIGIN)
    } else {
      // 使用配置域名
      urls.push(request.origin)
    }

    request.path && urls.push(request.path)
    urls.push(url)
    url = urls.join('/')
  }
  // 拼接url参数
  const getParams = qs.stringify(data)
  if (getParams) {
    url += url.indexOf('?') === -1 ? '?' : '&'
    url += getParams
  }
  return url
}

/**
 * 获取对象 如果这是个函数，获取函数的返回值
 * @param {*} data
 * @returns
 */
const execGetObject = (obj, ...params) => typeof obj === 'function' ? obj(...params) : obj

/**
 * 获取结果
 * @param {*} index
 * @param {*} res
 * @returns
 */
const execGetChild = (index, res, ...params) => typeof index === 'function' ? index(res, ...params) : recursionGetValue(index, res)

/**
 * 数据处理函数
 * @param {*} callback 处理函数列表
 * @param {*} result 要处理的数据
 * @returns
 */
const execMiddle = async (callbacks, result, params) => {
  for (let i = 0; i < callbacks.length; i++) {
    result = callbacks[i](result, params)
    if (result instanceof Promise) {
      result = await result
    }
  }
  return result
}

/**
 *选择文件
 * @param {*} type 选择类型 image图片 video视频
 * @param {*} param1
 * @returns
 */
const getMedia = async (type, {
  // 数量 仅图片有效
  count = 1,
  // 选择来源
  sourceType = ['album', 'camera'],
  // 图片压缩选项
  sizeType = ['original', 'compressed'],
  // 视频压缩选项
  compressed = false,
  // 拍摄最大视频时长
  maxDuration,
  // 默认拉起的是前置或者后置摄像头。部分 Android 手机下由于系统 ROM 不支持无法生效
  camera = 'back'
} = {}) => {

  if (process.env.TARO_ENV === 'rn') {
    let _type = sourceType.includes('album') ? 'photo' : 'camera'
    if (sourceType.length === 2) {
      const { tapIndex } = await Taro.showActionSheet({
        itemList: ['相机', '相册']
      })
      _type = tapIndex ? 'photo' : 'camera'
    }
    const option = {
      mediaTypes: ExpoImagePicker.MediaTypeOptions[type === 'image' ? 'Images' : 'Videos'],
      allowsMultipleSelection: count > 1,
      quality: 0.7,
      selectionLimit: count,
      videoMaxDuration: maxDuration,
      videoQuality: ExpoImagePicker.UIImagePickerControllerQualityType[compressed ? 'Low' : 'Medium']
    }
    let promise
    if (_type === 'photo') {
      const { granted } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync()
      if (!granted) {
        throw {
          message: '申请相册权限被拒绝'
        }
      }
      promise = ExpoImagePicker.launchImageLibraryAsync(option)
    } else {
      const { granted } = await ExpoCamera.requestCameraPermissionsAsync()
      if (!granted) {
        throw {
          message: '申请摄像头权限被拒绝'
        }
      }
      option.cameraType = ExpoCamera.CameraType[camera === 'back' ? 'back' : 'front']
      promise = ExpoImagePicker.launchCameraAsync(option)
    }
    const { canceled, assets } = await promise
    if (canceled) {
      throw {
        message: '取消选择'
      }
    }
    if (!Array.isArray(assets)) {
      throw {
        message: '错误数据：' + assets
      }
    }
    let sizes
    if (Platform.OS === 'android') {
      sizes = await Promise.all(assets
        .map(item => RNFS
          .stat(item.uri.replace('file://', ''))
          .then(res => res.size)
        ))
    }
    return assets.map((item, index) => ({
      path: item.uri,
      width: item.width,
      height: item.height,
      size: Platform.OS === 'android' ? sizes[index] : item.fileSize,
      duration: item.duration
    }))
  } else {
    if (type === 'video') {
      return Taro.chooseVideo({
        sourceType,
        compressed,
        maxDuration,
        camera
      }).then(res => ([{
        path: res.tempFilePath,
        size: res.size,
        width: res.width,
        height: res.height,
        thumb: res.thumbTempFilePath
      }]))
    } else {
      return Taro.chooseImage({
        count,
        sourceType,
        sizeType
      }).then(res => res.tempFiles)
    }
  }
}

export {
  getUrl,
  execGetObject,
  execGetChild,
  execMiddle,
  getMedia
}
