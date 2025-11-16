import { uploadFile as uploadFileTaro } from '@tarojs/taro'
import { getUrl, execGetChild, execGetObject, chooseMedia, execMiddle } from './util'
import { Platform } from '../rn/util'

const uploadFile = process.env.TARO_ENV === 'rn'
  ? (() => {
    const createFormData = (filePath, body = {}, name) => {
      const data = new FormData()
      const uri = Platform.OS === 'android' ? filePath : filePath.replace('file://', '');
      const fileObj = { uri, type: 'application/octet-stream', name: uri.substr(uri.lastIndexOf('/') + 1) || 'file' }
      Object.keys(body).forEach(key => {
        data.append(key, body[key])
      })
      data.append(name, fileObj)
      return data
    }

    return opts => {
      const { url, timeout = 60000, filePath, name, header, formData } = opts
      const xhr = new XMLHttpRequest()
      const execFetch = new Promise((resolve, reject) => {
        xhr.open('POST', url)
        xhr.responseType = 'text'
        // 上传进度
        xhr.upload.onprogress = e => {
          progressFunc && progressFunc({
            progress: e.lengthComputable ? e.loaded / e.total * 100 : 0,
            totalBytesSent: e.loaded,
            totalBytesExpectedToSend: e.total
          })
        }
        // 请求头
        const headers = {
          'Content-Type': 'multipart/form-data',
          ...header,
        }
        for (const key in headers) {
          if (headers.hasOwnProperty(key)) {
            xhr.setRequestHeader(key, headers[key])
          }
        }
        // 请求成功
        xhr.onload = () => {
          clearTimeout(timer)
          resolve({
            data: xhr.response,
            errMsg: 'ok',
            statusCode: xhr.status
          })
        }
        // 请求失败
        xhr.onerror = e => {
          clearTimeout(timer)
          reject({ errMsg: 'uploadFile fail: ' + e.type })
        }
        xhr.send(createFormData(filePath, formData, name))

        const timer = setTimeout(() => {
          xhr.abort()
          reject({ errMsg: 'uploadFile fail: 请求超时' })
        }, timeout)
      })
      let progressFunc
      execFetch.progress = func => {
        progressFunc = func
        return execFetch
      }
      // 取消上传
      execFetch.abort = () => {
        xhr.abort()
        return execFetch
      }
      return execFetch
    }
  })()
  : uploadFileTaro

const upload = (
  type = 'image',
  option
) => {
  let uploadTemp
  const promise = chooseMedia(type, option).then(res => {
    uploadTemp = uploadTempFile(res, option)
      .start(() => {
        callback.start?.()
      })
      .progress((...arg) => callback.progress?.(...arg))
    return uploadTemp
  })
  const callback = {
    start: null,
    progress: null
  }
  promise.start = func => {
    callback.start = func
    return promise
  }
  promise.progress = func => {
    callback.progress = func
    return promise
  }
  promise.abort = () => uploadTemp.abort?.()
  return promise
}

const uploadTempFile = (files, option = {}) => {

  // 合成配置
  const { request: requestConfig, upload: uploadConfig, result: resultConfig } = option.config || {}

  // 进度通知
  const progress = (i, size) => {
    allSize[i][1] = size
    let allProgress = 0
    allSize.map(item => {
      allProgress += item[1] / item[0]
    })
    if (allProgress - allProgressOld > 0.1) {
      progressFunc && progressFunc(allProgress / allSize.length)
      allProgressOld = allProgress
    }
  }
  const allUpload = []
  const allSize = []
  let startFunc
  let progressFunc
  let allProgressOld = 0

  const uploadPromise = new Promise((resolve, reject) => {
    // 让这里的代码在后面执行
    setTimeout(async () => {

      // 默认参数
      const requestParams = {
        url: getUrl(option.api || uploadConfig.api, {}, option),
        timeout: option.timeout
      }

      requestParams.header = {
        ...execGetObject(requestConfig.header, requestParams),
        ...option.header
      }

      // 收集参数
      const uploadParams = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        let params = {
          ...requestParams,
          file,
          filePath: file.path,
          name: option.requestField || uploadConfig.requestField,
          withCredentials: false
        }
        if (option.middle?.before?.length) {
          try {
            params = await execMiddle(option.middle.before, params, option)
            uploadParams.push(params)
          } catch (error) {
            reject(error)
            return
          }
        }
        allSize.push([file.size || 0, 0])
      }

      if (uploadParams.length === 0) {
        reject({ message: '未选择图片', code: resultConfig.errorCode })
        return
      }

      // 开始上传
      uploadParams.forEach((params, i) => {
        const uploadFileRes = uploadFile(params)
        uploadFileRes.progress?.(e => {
          progress(i, e.totalBytesSent)
        })
        if (option.middle?.result?.length) {
          allUpload.push(uploadFileRes)
        } else {
          allUpload.push(uploadFileRes.then(response => {
            try {
              if (typeof response.data === 'string') {
                response.data = JSON.parse(response.data)
              }
              const code = execGetChild(resultConfig.code, response)
              const message = execGetChild(resultConfig.message, response)
              if (code == (resultConfig.successCode || resultConfig.succesCode)) {
                return execGetChild(option.resultField || uploadConfig.resultField, response)
              } else {
                throw { code, message }
              }
            } catch (error) {
              throw { message: '数据格式错误', code: resultConfig.errorCode, error, data: response.data }
            }
          }))
        }
      })
      startFunc?.()
      Promise.all(allUpload).then(async res => {
        if (option.middle.result?.length) {
          try {
            res = await execMiddle(option.middle.result, res, uploadParams)
            resolve(res)
          } catch (error) {
            reject(error)
          }
        } else {
          resolve(res)
        }
      }).catch(async err => {
        if (option.middle.error?.length) {
          try {
            err = await execMiddle(option.middle.error, err)
            resolve(err)
          } catch (error) {
            reject(error)
          }
        } else {
          reject(err)
        }
      })
    }, 0)
  })
  // 开始通知
  uploadPromise.start = callback => {
    startFunc = callback
    return uploadPromise
  }
  // 进度通知
  uploadPromise.progress = callback => {
    progressFunc = callback
    return uploadPromise
  }
  // 取消上传
  uploadPromise.abort = () => {
    for (let i = 0; i < allUpload.length; i++) {
      allUpload[i].abort()
    }
    return uploadPromise
  }
  return uploadPromise
}

export const createUpload = (() => {
  const globalMiddle = {
    before: [],
    result: [],
    error: []
  }
  const remove = (arr, callback) => {
    return {
      remove: () => {
        const index = arr.indexOf(callback)
        ~index && arr.splice(index, 1)
      }
    }
  }
  return config => {
    const middle = {
      before: [],
      result: [],
      error: []
    }
    if (config?.middle) {
      Object.keys(config.middle).forEach(key => {
        middle[key].push(...config.middle[key])
      })
    }

    const on = (type, callback, sort = 0, common = false) => {
      const arr = (common ? globalMiddle : middle)
      const item = [callback, sort]
      arr[type].push(item)
      return remove(arr[type], item)
    }

    const sortMiddle = list => {
      return list.map(item => {
        if (typeof item === 'function') {
          return [item, 0]
        }
        return item
      })
        .sort(([, a], [, b]) => a - b)
        .map(v => v[0])
    }

    const getOption = option => {
      return {
        config: config?.config,
        middle: {
          before: sortMiddle([...globalMiddle.before, ...middle.before]),
          result: sortMiddle([...globalMiddle.result, ...middle.result]),
          error: sortMiddle([...globalMiddle.error, ...middle.error])
        },
        ...option
      }
    }

    return {
      upload: (type, option) => upload(type, getOption(option)),
      uploadTempFile: (files, option) => uploadTempFile(files, getOption(option)),
      middle: {
        before: (...arg) => {
          return on('before', ...arg)
        },
        result: (...arg) => {
          return on('result', ...arg)
        },
        error: (...arg) => {
          return on('error', ...arg)
        }
      }
    }
  }
})();
