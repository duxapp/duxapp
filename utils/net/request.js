import { request as taroRequest, showLoading, hideLoading } from '@tarojs/taro'
import qs from 'qs'
import { getUrl, execGetObject, execGetChild, execMiddle } from './util'
import { asyncTimeOut, toast } from '../util'
import { deepCopy } from '../object'

const bodyType = ['POST', 'PUT', 'DELETE']

const requestReact = async ({ url, data, header, timeout, ...option } = {}) => {

  if (bodyType.includes(option.method)) {
    option.body = data
  }
  option.headers = header

  // 用户终止请求
  const controller = new AbortController()
  option.signal = controller.signal

  const race = [fetch(url, option), asyncTimeOut(timeout)]
  const res = await Promise.race(race)
  if (res.type === 'timeout') {
    // 终止请求
    controller.abort()
    throw { statusCode: 500, errMsg: '请求超时' }
  }
  // 清除定时器
  race[1].clear()
  // const contentType = res.headers.get('Content-Type').toLowerCase()
  // const isJson = contentType.indexOf('application/json') === 0
  const headersValues = [...res.headers.values()]
  const result = {
    statusCode: res.status,
    errMsg: res.statusText,
    data: null,
    header: Object.fromEntries([...res.headers.keys()].map((key, index) => [key, headersValues[index]]))
  }
  let text = await res.text()
  try {
    text = JSON.parse(text)
  } catch (error) {
    console.log('错误的JSON数据', text)
  }
  result.data = text
  // if (isJson) {
  //   try {
  //     result.data = await res.json()
  //   } catch (error) {
  //     console.log(error, await res.text())
  //   }
  // } else {
  //   result.data = await res.text()
  // }
  return result
}

const request = (() => {
  const requestKeys = {}
  return (params = {}, origin) => {

    const { request: requestConfig = {}, result: resultConfig = {} } = params.config || {}
    const { contentType = 'application/json' } = requestConfig

    const urls = params.url.split('?')

    const configData = deepCopy(execGetObject(requestConfig.data, params))

    const method = params.method?.toUpperCase() || 'GET'

    const isBody = bodyType.includes(method)

    let requestParams = {
      url: getUrl(urls[0], void 0, params),
      method,
      contentType,
      query: {
        ...qs.parse(urls[1]),
        ...deepCopy(execGetObject(requestConfig.getData, params)),
        ...!isBody ? configData : {},
        ...!isBody ? deepCopy(params.data) : {}
      },
      body: isBody
        ? (params.data instanceof Array
          ? deepCopy(params.data)
          : {
            ...configData,
            ...deepCopy(params.data)
          })
        : null,
      header: {
        ...execGetObject(requestConfig.header, params),
        'Content-Type': contentType,
        Accept: 'application/json',
        ...params.header
      }
    }

    const { timeout = 30000, repeatTime = 500, toast: toastError, loading } = params

    // 防止过快的重复请求
    if (repeatTime) {
      const requestKey = requestParams.url +
        '-' + qs.stringify({ ...requestParams.query, ...requestParams.body }) +
        '-' + requestParams.method
      const now = Date.now()
      const last = requestKeys[requestKey]
      if (!last || now - last > repeatTime) {
        requestKeys[requestKey] = now
      } else {
        return Promise.reject({ code: 3, message: '重复请求', requestKey })
      }
    }

    // 请求中间件
    const middle = params.middle || {}

    let loadingClose
    const requestTask = (new Promise(async (resolve, reject) => {
      if (middle.before?.length) {
        try {
          requestParams = await execMiddle(middle.before, requestParams, origin)
        } catch (error) {
          reject(error)
          return
        }
      }
      taroRequestTask = (['h5', 'rn'].includes(process.env.TARO_ENV) ? requestReact : taroRequest)({
        url: `${requestParams.url}${Object.keys(requestParams.query).length ? '?' + qs.stringify(requestParams.query) : ''}`,
        data: !requestParams.body
          ? ''
          : contentType === 'application/json'
            ? JSON.stringify(requestParams.body)
            : qs.stringify(requestParams.body),
        header: requestParams.header,
        method: requestParams.method,
        timeout
      })
      if (!requestParams.url) {
        reject({ message: '请求URL错误', code: resultConfig.errorCode })
        return
      }
      if (typeof loading === 'function') {
        loadingClose = loading()
      } else if (loading) {
        showLoading({
          title: typeof loading === 'string' ? loading : '加载中'
        })
      }
      if (middle.result?.length) {
        // 中间件处理返回数据
        try {
          let result = await taroRequestTask
          if(!result.statusCode && result.errMsg === 'request:ok') {
            result.statusCode = 200
          }
          result = await execMiddle(middle.result, result, origin)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      } else {
        // 配置处理返回数据
        taroRequestTask.then(async res => {
          try {
            const code = execGetChild(resultConfig.code, res)
            const message = execGetChild(resultConfig.message, res)
            if (code == (resultConfig.successCode || resultConfig.succesCode)) {
              resolve(execGetChild(resultConfig.data, res))
            } else {
              reject({ code, message })
            }
          } catch (error) {
            reject({ message: '数据格式错误', code: resultConfig.errorCode })
          }
        }).catch(err => {
          const code = execGetChild(resultConfig.code, err)
          const message = execGetChild(resultConfig.message, err)
          reject({ message, code })
        })
      }
    })).then(res => {
      loading && loadingClose?.() || hideLoading()
      return res
    }).catch(async err => {
      loading && loadingClose?.() || hideLoading()
      if (middle.error?.length) {
        try {
          return await execMiddle(middle.error, err, origin)
        } catch (error) {
          throw error
        }
      }
      throw err
    }).catch(err => {
      if (toastError) {
        // 取消请求不提示错误
        if (err?.errMsg !== 'request:fail abort') {
          toast(err.message || JSON.stringify(err))
        }
      }
      err.url = requestParams?.url
      throw err
    })
    let taroRequestTask
    requestTask.abort = () => taroRequestTask?.abort()
    return requestTask
  }
})();

const searchQuickMarks = {}
const throttleRequest = (params, mark = '') => {
  const key = params.url + mark
  if (searchQuickMarks[key] === undefined) {
    searchQuickMarks[key] = {
      timer: null,
      prevReject: null,
      requestTask: null,
    }
  }
  const item = searchQuickMarks[key]
  return new Promise((resolve, reject) => {
    if (item.timer) {
      clearTimeout(item.timer)
      item.prevReject({ message: '过快请求', code: 1 })
    }
    if (item.requestTask) {
      item.requestTask.abort()
      item.requestTask = null
      item.prevReject({ message: '请求被覆盖', code: 2 })
    }
    item.prevReject = reject
    item.timer = setTimeout(() => {
      item.timer = null
      item.requestTask = request(params).then(res => {
        item.requestTask = null
        resolve(res)
      }).catch(err => {
        item.requestTask = null
        reject(err)
      })
    }, 200)
  })
}

export const createRequest = (() => {
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

    const getParams = params => {
      return {
        config: config?.config,
        ...(typeof params === 'string' ? { url: params } : params),
        middle: {
          before: sortMiddle([...(params.middle?.before || []), ...globalMiddle.before, ...middle.before]),
          result: sortMiddle([...(params.middle?.result || []), ...globalMiddle.result, ...middle.result]),
          error: sortMiddle([...(params.middle?.error || []), ...globalMiddle.error, ...middle.error])
        },
      }
    }

    return {
      request: params => request(getParams(params), params),
      throttleRequest: params => throttleRequest(getParams(params), params),
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
