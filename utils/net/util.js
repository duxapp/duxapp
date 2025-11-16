import { chooseMedia as chooseMediaTaro } from '@tarojs/taro'
import qs from 'qs'
import { ActionSheet } from '@/duxapp/components/ActionSheet'
import { recursionGetValue } from '../object'
import { ExpoImagePicker } from '../rn/util'

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
  if (!callbacks?.length) {
    return result
  }
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
 * @param {*} type 选择类型 image图片 video视频 all 全部
 * @param {*} param1
 * @returns
 */
const chooseMedia = async (type = 'image', options = {}) => {

  const {
    // 数量
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
  } = options

  const isCompressed = compressed || (sizeType.length === 1 && sizeType[0] === 'compressed')

  if (process.env.TARO_ENV === 'rn') {
    let source = sourceType.includes('album') ? 'photo' : 'camera'
    let sourceName = sourceType.includes('album') ? '相册' : '相机'
    if (sourceType.length === 2) {
      const select = await ActionSheet.show({
        list: ['相册', ...type === 'all' ? ['拍照', '录像'] : ['相机']]
      })
      sourceName = select.item
      source = select.index ? 'camera' : 'photo'
    }
    const option = {
      mediaTypes:
        type === 'image' ? 'images' :
          type === 'video' ? 'videos' : (
            sourceName === '相册' ? ['images', 'videos'] :
              sourceName === '拍照' ? 'images' : 'videos'
          ),
      allowsMultipleSelection: count > 1,
      quality: isCompressed ? 0.6 : 0.8,
      selectionLimit: count,
      videoMaxDuration: maxDuration,
      videoQuality: ExpoImagePicker.UIImagePickerControllerQualityType[isCompressed ? 'Low' : 'Medium']
    }
    let promise
    if (source === 'photo') {
      const { granted } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync()
      if (!granted) {
        throw {
          message: '申请相册权限被拒绝'
        }
      }
      promise = ExpoImagePicker.launchImageLibraryAsync(option)
    } else {
      const { granted } = await ExpoImagePicker.requestCameraPermissionsAsync()
      if (!granted) {
        throw {
          message: '申请摄像头权限被拒绝'
        }
      }
      option.cameraType = camera === 'back' ? 'back' : 'front'
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
    const files = assets.map(item => ({
      type: item.type,
      mime: item.mimeType,
      path: item.uri,
      width: item.width,
      height: item.height,
      size: item.fileSize,
      duration: item.duration
    }))
    return execMiddle(chooseMedia.middle?.sort((a, b) => a[1] - b[1]).map(v => v[0]), files, options)
  } else {
    return chooseMediaTaro({
      count,
      mediaType: type === 'all' ? ['mix'] : [type],
      sourceType,
      sizeType: isCompressed ? ['compressed'] : sizeType,
      maxDuration,
      camera
    }).then(({ tempFiles }) => {

      const getMimeType = filename => {
        const extension = filename.split('.').pop().toLowerCase()

        const mimeTypes = {
          // 图片类型
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'gif': 'image/gif',
          'webp': 'image/webp',
          'svg': 'image/svg+xml',
          'bmp': 'image/bmp',
          'ico': 'image/x-icon',
          'tif': 'image/tiff',
          'tiff': 'image/tiff',
          'avif': 'image/avif',

          // 视频类型
          'mp4': 'video/mp4',
          'webm': 'video/webm',
          'ogg': 'video/ogg',
          'ogv': 'video/ogg',
          'mov': 'video/quicktime',
          'avi': 'video/x-msvideo',
          'wmv': 'video/x-ms-wmv',
          'flv': 'video/x-flv',
          'mkv': 'video/x-matroska',
          'mpeg': 'video/mpeg',
          'mpg': 'video/mpeg',
          '3gp': 'video/3gpp',
          '3g2': 'video/3gpp2'
        }

        return mimeTypes[extension] || 'application/octet-stream'
      }

      const files = tempFiles.map(item => {
        return {
          type: item.fileType,
          mime: getMimeType(item.tempFilePath),
          path: item.tempFilePath,
          size: item.size,
          width: item.width,
          height: item.height,
          thumb: item.thumbTempFilePath,
          duration: item.duration * 1000
        }
      })
      return execMiddle(chooseMedia.middle?.sort((a, b) => a[1] - b[1]).map(v => v[0]), files, options)
    })
  }
}

const chooseMediaMiddle = (callback, sort = 0) => {
  chooseMedia.middle ||= []
  chooseMedia.middle.push([callback, sort])
}

export {
  getUrl,
  execGetObject,
  execGetChild,
  execMiddle,
  chooseMedia,
  chooseMediaMiddle
}
