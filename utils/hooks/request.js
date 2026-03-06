import { useState, useCallback, useEffect, useRef } from 'react'
import base64 from 'crypto-js/enc-base64'
import { useDidShow } from '@tarojs/taro'
import { useDeepObject } from './common'
import { ObjectManage } from '../data'
import { duxappLang } from '../lang'

const isPlainObject = data => data && typeof data === 'object' && !Array.isArray(data)

const mergeLevelOneObject = (base, current) => {
  if (typeof current === 'undefined') {
    return base
  }
  if (isPlainObject(base) && isPlainObject(current)) {
    return {
      ...base,
      ...current
    }
  }
  return current
}

const createReloadOption = (option, tempOption) => {
  if (typeof tempOption === 'undefined') {
    return option
  }
  const baseOption = typeof option === 'string' ? { url: option } : (option || {})
  const currentOption = typeof tempOption === 'string' ? { url: tempOption } : (tempOption || {})
  // reload 仅支持临时覆盖请求参数，不允许动态传入 config / middle
  const { config, middle, ...current } = currentOption
  return {
    ...baseOption,
    ...current,
    data: mergeLevelOneObject(baseOption.data, current.data),
    header: mergeLevelOneObject(baseOption.header, current.header)
  }
}

export const createRequestHooks = request => {
  return {
    useRequest: (option, config) => {

      const init = useRef(false)

      const _config = useRef()
      _config.current = { ..._config.current, ...config }

      const [data, setData] = useState(_config.current?.defaultData ?? (config?.cache && requestCache.getCache(option)) ?? {})

      const [status, setStatus] = useState(true)

      const [error, setError] = useState()

      const _option = useDeepObject(option)

      const resultAction = useCallback(async res => {
        if (_config.current?.detailCallback) {
          res = _config.current.detailCallback(res)
          if (res instanceof Promise) {
            res = await res
          }
        }
        const _data = _config.current?.field ? res[_config.current.field] : res
        setData(_data)
        requestCache.setCache(_option, _data)
        return _data
      }, [_option])

      const reload = useCallback((tempOption) => {
        if (!_option || _config.current.status) {
          return Promise.reject()
        }
        setStatus(true)
        _config.current.status = true
        const complete = () => {
          _config.current.status = false
          init.current = true
          setStatus(false)
        }
        return request(createReloadOption(_option, tempOption))
          .catch(err => {
            if (_config.current?.onError) {
              return _config.current?.onError(err)
            }
            complete()
            throw err
          })
          .then(res => {
            res = resultAction(res)
            complete()
            setError()
            return res
          }).catch(err => {
            complete()
            setError(err)
            throw err
          })
      }, [_option, resultAction])

      useEffect(() => {
        if (config?.ready === false) {
          return
        }
        reload()
      }, [reload, config?.ready])

      useDidShow(() => {
        // 在上面页面关掉的时候刷新数据
        init.current && config?.reloadForShow && reload()
      })

      return [
        data,
        {
          data,
          status,
          loading: status,
          error,
          reload,
          setData
        }
      ]
    },
    usePageData: (option, config) => {

      const requestOption = useDeepObject(option && typeof option === 'object' ? option : { url: option })

      const [list, setList] = useState(config?.defaultListData ?? (config?.cache && requestCache.getCache(option)) ?? [])

      const [loading, setLoading] = useState(false)

      const [refresh, setRefresh] = useState(false)

      const [loadEnd, setLoadEnd] = useState(false)

      const currentState = useRef({ requestOption, config, page: 1, loadEnd: false, loading: false, list })
      currentState.current.config = config
      currentState.current.list = list

      const getList = useCallback((tempOption) => {
        const state = currentState.current
        // 使用传入的数据 不通过接口加载
        state.loading = true
        setLoading(true)
        if (state.page === 1) {
          setRefresh(true)
        }
        const mergedRequestOption = createReloadOption(state.requestOption, tempOption)
        let _option = {
          ...mergedRequestOption,
          data: {
            ...mergedRequestOption?.data,
            page: state.page
          },
          toast: mergedRequestOption?.toast ?? true
        }
        if (currentState.current.config?.onRequestOption) {
          _option = currentState.current.config.onRequestOption(_option, state)
        }
        return request(_option).then(async res => {
          const field = state.config?.field || 'list'
          let _list = res[field]
          if (typeof _list === 'undefined') {
            if (Array.isArray(res)) {
              _list = res
            } else {
              return console.error('获取列表数据错误：' + field + '字段不存在')
            }
          }
          if (state.config?.listCallback) {
            _list = state.config?.listCallback(_list, res)
            if (_list instanceof Promise) {
              _list = await _list
            }
          }
          if (!_list?.length) {
            state.loadEnd = true
            setLoadEnd(true)
          }
          setList(old => {
            if (state.page > 1) {
              return [...old, ..._list]
            } else {
              return _list
            }
          })
          state.page === 1 && requestCache.setCache(state.requestOption, _list)
          state.loading = false
          setLoading(false)
          setRefresh(false)
          return _list
        }).catch(error => {
          console.log('error', error)
          state.loading = false
          setLoading(false)
          setRefresh(false)
        })
      }, [])

      const next = useCallback(() => {
        if (!currentState.current.init) {
          return Promise.reject(duxappLang.t('request.notInit'))
        }
        if (currentState.current.loadEnd) {
          return Promise.reject(duxappLang.t('request.loadEnd'))
        }
        if (currentState.current.loading) {
          return Promise.reject(duxappLang.t('request.loading'))
        }
        currentState.current.page++
        return getList()
      }, [getList])

      const reload = useCallback((tempOption) => {
        if (currentState.current.loading) {
          return Promise.reject(duxappLang.t('request.loading'))
        }
        if (currentState.current.loadEnd) {
          currentState.current.loadEnd = false
          setLoadEnd(false)
        }
        currentState.current.page = 1
        return getList(tempOption)
      }, [getList])

      useEffect(() => {
        if (config?.ready === false) {
          return
        }
        currentState.current.requestOption = requestOption
        reload().catch(() => { }).finally(() => {
          // 防止RN端next执行的比useEffect更快
          currentState.current.init = true
        })
      }, [requestOption, config?.ready, reload])

      return [list, {
        list,
        loading,
        currentData: currentState.current,
        refresh,
        loadEnd,
        next,
        reload,
        setList
      }]
    }
  }
}


class RequestHookCache extends ObjectManage {
  constructor() {
    super({
      cache: true,
      cacheKey: 'request-hook-cache'
    })
  }

  _getKey = option => {
    if (typeof option === 'string') {
      option = { url: option }
    }
    return base64.parse(`${option.url}-${option.method || 'GET'}-${JSON.stringify(option.data)}-`)
  }

  getCache = option => {
    return this.data[this._getKey(option)]
  }

  setCache = (option, data) => {
    this.set({
      ...this.data,
      [this._getKey(option)]: data
    })
  }
}

const requestCache = new RequestHookCache()
