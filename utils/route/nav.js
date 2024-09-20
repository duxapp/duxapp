import {
  getCurrentPages, getCurrentInstance, makePhoneCall, openLocation,
  navigateBack, navigateTo, navigateToMiniProgram, reLaunch, redirectTo
} from '@tarojs/taro'
import { useMemo } from 'react'
import qs from 'qs'
import routerPage, { pageTransfer, routes, currentPage } from './route'
import { bdEncrypt } from '../map'
import Map from '../map/map'
import { QuickEvent } from '../QuickEvent'
import { deepCopy } from '../object'
import { asyncTimeOut, getPlatform } from '../util'

export class PageBackData {

  callback = null

  on = () => {
    return new Promise((resolve, reject) => {
      this.callback = [resolve, reject]
    })
  }

  resolve = res => {
    if (this.callback) {
      this.callback[0]?.(res)
      this.callback = null
    }
  }

  reject = err => {
    if (this.callback) {
      this.callback[1]?.(err)
      this.callback = null
    }
  }
}


class Route {

  /**
   * 当前路由栈
   */
  current = []

  /**
   * 在程序启动初始化的时候调用此方法初始化路由
   */
  init = async () => {
    const _getCurrentInstance = async (level = 1) => {
      if (level > 20 || process.env.TARO_ENV === 'rn') {
        return { params: {}, path: Object.keys(routerPage)[0] }
      }
      if (process.env.TARO_ENV === 'h5') {
        const [, hash] = window.location.hash.split('#')
        if (hash) {
          const [path, params] = hash.split('?')
          return {
            path,
            params: params ? qs.parse(params) : {}
          }
        }
      } else {
        const { router } = getCurrentInstance()
        if (router) {
          router.params = qs.parse(Object.keys(router.params).map(key => `${key}=${router.params[key]}`).join('&'))
          return router
        }
      }
      await asyncTimeOut(15)
      return await _getCurrentInstance(level + 1)
    }

    const { path, params } = await _getCurrentInstance()

    this.current.push({
      path: path.startsWith('/') ? path.substring(1) : path,
      params: this.decodeParams(params)
    })
  }

  /**
   * 小程序show事件初始化
   * @param  {...any} arg
   */
  showInit = router => {
    const getData = () => {
      if (process.env.TARO_ENV === 'h5') {
        const [, hash] = window.location.hash.split('#')
        if (hash) {
          const [path, params] = hash.split('?')
          return {
            path,
            params: params ? qs.parse(params) : {}
          }
        }
      } else {
        return {
          params: qs.parse(Object.keys(router.query || {}).map(key => `${key}=${router.query[key]}`).join('&')),
          path: router.path
        }
      }
    }
    const { path, params } = getData()
    this.current[0] = {
      path: path.startsWith('/') ? path.substring(1) : path,
      params: this.decodeParams(params)
    }
  }

  historyUrl = ''
  time = ''

  nav = async (url, data = {}) => {
    if (Route.historyUrl == url && url !== 'back:system' && new Date().getTime() - Route.time < 1000) {
      return
    }
    Route.time = new Date().getTime()
    Route.historyUrl = url
    if (!url || typeof url !== 'string') throw '无效的url'
    const option = this.getOption(url, data)
    if (!option) return
    const pageRouter = routerPage[option.path]
    if (option.type !== 'navigateBack' && !url.startsWith('plugin-private') && !pageRouter) {
      throw option.path + ' 页面未注册 请在router.js中注册页面'
    }

    try {
      for (const iterator of this.navBeforeEvent.callbacks) {
        await iterator(pageRouter, option)
      }

      // 将状态注入路由
      let delPage = []
      if (option.type === 'navigateTo') {
        this.current.push({
          path: option.path,
          params: option.params
        })
      } else if (option.type === 'redirectTo') {
        delPage = this.current.splice(this.current.length - 1, 1, {
          path: option.path,
          params: option.params
        })
      } else if (option.type === 'navigateBack') {
        if (this.navBackData) {
          this.navBackData.option.delta--
          if (this.navBackData.option.delta <= 0) {
            // 使用nav关闭多个页面需要等待每一个卸载都执行完在执行回调
            delPage = this.navBackData.delPage
            option.params = this.navBackData.option?.params
            delete this.navBackData
          }
        } else {
          delPage = this.current.splice(this.current.length - option.delta)
          if (!option.system) {
            // 使用nav返回的将数据缓存起来，等待系统的返回执行的时候统一执行回调
            this.navBackData = { delPage, option }
            delPage = []
          }
        }
      }
      // 执行返回回调
      if (delPage.length) {
        const first = delPage[0]
        if (option.type === 'navigateBack') {
          const _resolve = first.pageBackData?.resolve
          // 等关闭动画结束再执行回调，防止页面不渲染
          setTimeout(() => _resolve?.(option.params), 300)
          delete first.pageBackData
        }
        delPage.forEach(item => item.pageBackData?.reject('页面关闭'))
      }
      // 如果是由nav发起的back则不触发事件
      if (option.type === 'navigateBack' && !option.system) {
        // 在app端打印路由跳转地址
        process.env.TARO_ENV === 'rn' && console.log(option.path || 'back', option.params)
        // 触发跳转监听事件
        this.navAfterEvent.trigger(option)
      }
      // 由系统调用 不执行具体的跳转
      if (option.system) {
        this.oldNavType = 'navigateBack'
        return
      }
      // 保存当前的跳转方式
      this.oldNavType = option.type
      const navs = { navigateBack, navigateTo, navigateToMiniProgram, reLaunch, redirectTo }
      await navs[option.type]({
        ...(option.type === 'navigateBack'
          ? { delta: option.delta }
          : { url: option.url })
      })
      return {
        backData: () => {
          if (option.type === 'navigateTo') {
            const current = this.current[this.current.length - 1]
            current.pageBackData = new PageBackData()
            return current.pageBackData.on()
          }
          return Promise.reject('只有跳转页面支持')
        }
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * 页面卸载的时候调用此函数
   * 由系统返回按钮点击返回 或者调用了重定向跳转
   */
  pageUnmount = () => {
    // 重定向导致的页面卸载，不执行关闭方法
    if (this.oldNavType !== 'redirectTo') {
      this.nav('back:system')
    }
  }

  navBeforeCallbacks = []

  navBeforeEvent = new QuickEvent()

  /**
   * 在跳转之前执行的函数 可以返回异步
   * @param {*} callback
   */
  onNavBefore = this.navBeforeEvent.on

  navAfterEvent = new QuickEvent()
  /**
   * 监听路由跳转成功
   */
  onNavAfter = this.navAfterEvent.on

  /**
   * 跳转到新地址
   * @param {string} url 跳转地址
   * @param {object} data 跳转参数
   * @returns
   */
  push = (url, data) => {
    return this.nav('navigate:' + url, data)
  }

  /**
   * 重定向到新页面
   * @param {string} url 跳转地址
   * @param {object} data 跳转参数
   * @returns
   */
  redirect = (url, data) => {
    return this.nav('redirect:' + url, data)
  }

  /**
   * 返回页面
   * @param {number|string} num 返回层数 默认1 home表示返回到首页，即便首页没有打开也会返回首页
   * @param {object} data 要传到到上一个页面的数据
   * @returns
   */
  back = (num = 1, data) => {
    return this.nav('back:' + num, data)
  }

  /**
   * 解析路由参数
   * @param {string} url 跳转地址
   * @param {object} data 跳转参数
   * @returns
   */
  getOption = (url, data) => {
    const option = {
      type: '',
      url: '',
      path: '',
      params: data
    }
    // 解析参数
    const urls = url.split(':')
    if (urls.length === 1) {
      urls.unshift('navigate')
    }

    const [type, page] = urls

    let [path, query] = page.split('?')
    // 可以在url上携带携带参数的跳转
    if (query) {
      option.params = {
        ...qs.parse(query),
        ...option.params
      }
    }

    // 打开网页
    if (['http', 'https'].includes(type)) {
      nav('/duxapp/webview/index', {
        url: type + ':' + page
      })
      return false
    } else if (type === 'tel') {
      // 打开拨号
      makePhoneCall({
        phoneNumber: page
      })
      return false
    } else if (type === 'map') {
      // 打开地图
      const { latitude, longitude, address = '', name = '' } = option.params

      if (latitude && longitude) {
        const env = process.env.TARO_ENV
        if (env === 'weapp') {
          openLocation({
            latitude: +latitude,
            longitude: +longitude,
            address,
            name
          })
        } else if (env === 'h5') {
          if (getPlatform() === 'wechat' && window.WeixinJSBridge) {
            window.WeixinJSBridge.invoke(
              'openLocation', {
              latitude: +latitude,
              longitude: +longitude,
              name,
              address,
              scale: 28,
              infoUrl: ''
            }, openRes => {
              if (openRes.err_msg !== 'open_location:ok') {
                const res = bdEncrypt(latitude, longitude)
                nav('duxapp/webview/index', {
                  url: `https://api.map.baidu.com/geocoder?location=${res.lat},${res.lon}&output=html&src=com.duxapp`
                })
              }
            })
          } else {
            const res = bdEncrypt(latitude, longitude)
            nav('duxapp/webview/index', {
              url: `https://api.map.baidu.com/geocoder?location=${res.lat},${res.lon}&output=html&src=com.duxapp`
            })
          }
        } else if (env === 'rn') {
          const res = bdEncrypt(latitude, longitude)
          Map.openMap({
            latitude: res.lat,
            longitude: res.lon,
            address,
            name
          })
        }
      } else {
        console.warn('经纬度不能为空！')
      }
      return false
    } else if (type === 'plugin-private') {
      // 打开小程序插件
      if (process.env.TARO_ENV !== 'weapp') {
        console.warn('仅限小程序使用打开插件功能')
        return false
      }
      option.url = type + ':' + page
      return option
    } else if (type === 'relaunch') {
      // 重启
      option.type = 'reLaunch'
      return option
    }

    // 删除路由上的第一个/
    if (path.startsWith('/')) {
      path = path.replace('/', '')
    }

    // 检查模块是否配置了path路径 跳转加上路径
    if (!Object.keys(routerPage).includes(path)) {
      const paths = path.split('/')
      if (routes[paths[0]]?.path) {
        paths.splice(1, 0, routes[paths[0]].path)
      }
      path = paths.join('/')
    }

    // 下面三个类型和页面跳转相关，需要加到路由里面处理
    switch (type) {
      case 'navigate':
        option.type = 'navigateTo'
        break
      case 'redirect':
        option.type = 'redirectTo'
        break
      case 'back':
        option.delta = page || 1
        option.type = 'navigateBack'
        if (option.delta === 'home') {
          // 返回到主页
          const { length } = getCurrentPages()
          option.delta = length - 1
          const current = currentPage()
          const index = Object.keys(routerPage).find(key => !routerPage[key].disable)
          if (option.delta === 0 && current !== index) {
            option.type = 'redirectTo'
            path = index
            break
          }
        } else if (option.delta === 'system') {
          // 由系统的返回键调用的返回
          option.delta = 1
          option.system = true
        }
        option.delta = Number(option.delta)
        if (option.delta < 1) {
          return false
        }
    }

    // 页面路由
    if (['navigateTo', 'redirectTo'].includes(option.type)) {
      // 验证路由转移后的路径
      const transfer = pageTransfer(path, option.params)
      option.path = transfer.path
      option.url = `/${transfer.path}${Object.keys(transfer.params).length ? '?' + qs.stringify(option.params) : ''}`
    }
    return option
  }

  /**
   * 将nav跳转之后的参数解析成对象
   * @param {object} obj
   * @return {object}
   */
  decodeParams = obj => {
    let params = qs.parse(qs.stringify(obj))
    if (params.scene) {
      params = {
        ...qs.parse(decodeURIComponent(params.scene)),
        ...params
      }
    }

    // 将参数解码
    const decode = data => {
      if (typeof data === 'object') {
        const _data = Array.isArray(data) ? [] : {}
        for (const key in data) {
          if (Object.hasOwnProperty.call(data, key)) {
            if (typeof data[key] === 'string') {
              _data[key] = decodeURIComponent(data[key])
            } else if (typeof data[key] === 'object') {
              _data[key] = decode(data[key])
            } else {
              _data[key] = data[key]
            }
          }
        }
        return _data
      }
      return data
    }
    return { ...this.getQueryVariable(), ...decode(params) }
  }

  /**
   * 获取h5端的参数返回一个对象
   */
  getQueryVariable = () => {
    if (process.env.TARO_ENV === 'h5') {
      const query = window.location.search.substring(1)
      if (!query) return {}
      return qs.parse(query)
    } else {
      return {}
    }
  }

  /**
   * 获取h5端的Hash参数和Hash值 返回一个对象
   */
  getHashQueryVariable = () => {
    if (process.env.TARO_ENV === 'h5' && window.location.hash) {
      const [hash, query] = window.location.hash.split('?')
      const params = query ? qs.parse(query) : {}
      return {
        hash,
        params
      }
    } else {
      return { hash: '', params: {} }
    }
  }

  /**
   * 判断指定路由在路径中位置，返回pages和查找结果paths
   * @param {String} path
   */
  getPathPosition = path => {
    const pages = getCurrentPages()
    const paths = []
    for (let i = 0; i < pages.length; i++) {
      let route = pages[i].route.split('?')[0]
      if (route[0] === '/') {
        route = route.substring(1)
      }
      if (route === path) {
        paths.push(route)
      }
    }
    return {
      pages,
      paths,
    }
  }

  useRoute = () => {

    const data = useMemo(() => {
      return deepCopy(this.current[this.current.length - 1]) || { path: '', params: {} }
    }, [])

    return data
  }
}

export const route = new Route()

/**
 * 获取当前页面路由信息
 * @returns {params: {}, path: ''}
 */
export const useRoute = route.useRoute

export const nav = route.nav

export const decodeParams = route.decodeParams
