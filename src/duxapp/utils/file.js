import Taro from '@tarojs/taro'
import { toast } from './util'
import { crequestMultiplePermission, Platform, RNShare, RNFS } from './rn'
import { nav } from './route'

/**
 * 将图片或视频保存到相册
 * @param {*} url 或者多个url组成的数组
 */
export const saveToPhoto = async (url) => {
  if (process.env.TARO_ENV === 'h5') {
    throw {
      message: '暂不支持h5保存到相册',
    }
  }
  if (typeof url === 'string') {
    url = [url]
  }
  let stop
  try {
    if (process.env.TARO_ENV === 'weapp') {
      try {
        if (process.env.TARO_ENV === 'weapp') {
          await Taro.authorize({ scope: 'scope.writePhotosAlbum' })
        }
      } catch (error) {
        await Taro.showModal({
          title: '授权提示',
          content: '请手动打开设置开启保存到相册权限后重试',
          showCancel: false,
        })
        throw '未授权'
      }
    }
    // stop = loading('图片加载中')
    const promisArr = []
    for (let i = 0; i < url.length; i++) {
      promisArr.push(Taro.downloadFile({ url: url[i] }))
    }
    const localList = await Promise.all(promisArr)
    // loading('正在保存')
    for (let i = 0; i < localList.length; i++) {
      await Taro.saveImageToPhotosAlbum({
        filePath: localList[i].tempFilePath,
      })
    }
    stop()
    // toast('保存成功')
    Taro.showToast({
      title: '保存成功',
    })
  } catch (err) {
    stop?.()
    toast(err.errMsg || err)
    throw {
      message: err.errMsg || err,
    }
  }
}

/**
 * save fileUrl to local
 * @param {*} url
 */
export const saveToFile = async (url) => {
  if (process.env.TARO_ENV === 'rn') {
    // platform rn start
    try {
      await crequestMultiplePermission()
      toast('文件加载中 请稍后')
      const { tempFilePath } = await Taro.downloadFile({ url })
      if (Platform.OS === 'android') {
        const tempFilePathArr = tempFilePath.split('/')
        await RNFS.moveFile(
          tempFilePath,
          RNFS.DownloadDirectoryPath +
          '/' +
          tempFilePathArr[tempFilePathArr.length - 1]
        )
        toast('文件已保存至Download目录下')
      } else {
        await RNShare.open({
          url: tempFilePath,
          saveToFiles: true,
        })
        toast('保存成功')
      }
    } catch (error) {
      console.warn('保存失败', error)
    }
  }
  // platform rn end
}

/**
 * 将base64格式的图片保存到相册
 * @param {string} data
 */
export const base64ImageToPhoto = async (data, ext = 'jpg') => {
  if (process.env.TARO_ENV === 'rn') {
    const filePath = RNFS.CachesDirectoryPath + '/temp.' + ext
    await RNFS.writeFile(filePath, data, 'base64')
    await Taro.saveImageToPhotosAlbum({ filePath })
    Taro.showToast({
      title: '已保存到相册',
    })
  }
}

export const openFile = (file) => {
  if (process.env.TARO_ENV === 'rn') {
    nav('https://view.officeapps.live.com/op/view.aspx?src=' + file)
  } else if (process.env.TARO_ENV === 'weapp') {
    if (!file || typeof file !== 'string') {
      Taro.showToast({
        title: '非法文件路径',
        icon: 'error',
        duration: 1000,
      })
      return false
    }

    const fileTypes = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf']
    const s = file.split('.')
    const fileType = s[s.length - 1]
    if (fileTypes.includes(fileType?.toLowerCase())) {
      Taro.downloadFile({
        url: file,
        success: function (dfile) {
          const filePath = dfile.tempFilePath
          Taro.openDocument({
            filePath: filePath,
            fail: function (res) {
              const msg = res?.errMsg
              if (msg) {
                toast('文件打开失败：' + msg)
              }
            },
          })
        },
        fail: function (res) {
          const msg = res?.errMsg
          if (msg) {
            toast('文件下载失败：' + msg)
          }
        },
      })
    } else {
      toast('不支持该文件类型')
    }
  }
}
