import Taro from '@tarojs/taro'
import { QuickEvent } from './QuickEvent'

export class Cache {
  constructor({
    // 数据key
    key = '',
    global,
    defaultData
  }) {
    if (!key) {
      throw '使用Cache请设置Key'
    }
    this.config = {
      key,
      global
    }
    if (defaultData) {
      this.data = defaultData
    }
    this.init()
  }

  config = {
    key: '',
    global: false,
    readStatus: false
  }

  localEvent = new QuickEvent()

  data

  async init() {
    try {
      const res = await Taro.getStorage({ key: this.config.key })
      if (res?.data) {
        try {
          this.data = JSON.parse(res.data)
        } catch (error) {
          this.data = res.data
        }
        if (this.config.global) {
          global[this.config.key] = this.data
        }
        this.config.readStatus = true
        this.localEvent.trigger(true, this.data)
      } else {
        throw '未找到本地存储'
      }
    } catch (error) {
      this.config.readStatus = true
      this.localEvent.trigger(false, this.data)
      // console.log('读取缓存失败:' + this.config.key, error)
    }
  }

  // 设置数据
  set = _data => {
    if (typeof _data === 'function') {
      this.data = _data(this.data)
    } else {
      this.data = _data
    }
    if (this.config.global) {
      global[this.config.key] = this.data
    }
    Taro.setStorage({
      key: this.config.key,
      data: JSON.stringify(this.data)
    })
  }

  // 获取数据
  get = () => this.data

  // 监听读取了本地数据成功 需要在new之后立马创建监听 否则可能没有回调
  onLocal = this.localEvent.on

  // 异步获取数据，会等待本地缓存数据读取成功 返回一个Promise
  getAsync = async () => {
    if (this.config.readStatus) {
      return this.data
    }
    return new Promise(resolve => {
      const stop = this.onLocal(() => {
        stop.remove()
        resolve(this.data)
      })
    }, [])
  }
}

export class ObjectManage {

  constructor({
    // 是否将当前数据缓存到本地，要保存到本地需要设置key，下次读取的时候将调用最后一次设置的值
    cache,
    // 缓存数据key
    cacheKey = '',
    // 将数据缓存到全局变量
    global,
    defaultData
  }) {
    if (defaultData) {
      this.data = defaultData
    }
    if (cache && cacheKey) {
      this.cache = new Cache({ key: cacheKey, global, defaultData })
      this.cache.getAsync().then(_data => {
        if (_data && this.data !== _data) {
          this.data = _data
          this.quickEvent.trigger(this.data, 'cache')
        }
      })
    }
  }

  // 缓存对象
  cache

  // 事件对象
  quickEvent = new QuickEvent()

  data = {}

  // 监听选中项改变事件
  onSet = this.quickEvent.on

  // 替换数据
  set = data => {
    if (typeof data === 'function') {
      this.data = data(this.data)
    } else {
      this.data = data
    }
    this.cache?.set(this.data)
    this.quickEvent.trigger(this.data, 'set')
  }

  // 清除数据
  clear = () => {
    this.data = {}
    this.execCallback()
    this.quickEvent.trigger(this.data, 'clear')
    this.cache?.set(this.data)
  }
}
