/* eslint-disable react-hooks/rules-of-hooks */
import { getStorage, setStorage, getStorageSync } from '@tarojs/taro'
import { useEffect, useMemo, useState } from 'react'
import { QuickEvent } from './QuickEvent'

export class Cache {
  constructor({
    key,
    defaultData,
    sync
  }) {
    if (!key || typeof key !== 'string') {
      throw '使用Cache请设置字符串 key'
    }
    this.config = {
      key,
      sync,
      readStatus: false
    }
    if (defaultData) {
      this.data = defaultData
    }
    this.init()
  }

  event = new QuickEvent()

  async init() {
    try {
      let res
      const isSync = this.config.sync && !['rn', 'harmony_cpp'].includes(process.env.TARO_ENV)
      if (isSync) {
        res = getStorageSync(this.config.key)
      } else {
        res = await getStorage({ key: this.config.key })
      }
      const data = isSync ? res : res?.data
      if (data) {
        try {
          this.data = JSON.parse(data)
        } catch (error) {
          this.data = data
        }
        this.config.readStatus = true
        this.event.trigger(true, this.data)
      } else {
        throw '未找到本地存储'
      }
    } catch (error) {
      this.config.readStatus = true
      this.event.trigger(false, this.data)
    }
  }

  // 设置数据
  set(_data) {
    if (typeof _data === 'function') {
      this.data = _data(this.data)
    } else {
      this.data = _data
    }
    setStorage({
      key: this.config.key,
      data: JSON.stringify(this.data)
    })
  }

  // 获取数据
  get() {
    return this.data
  }
}

export class ObjectManage {

  constructor({
    // 是否将当前数据缓存到本地，要保存到本地需要设置key，下次读取的时候将调用最后一次设置的值
    cache,
    // 缓存数据key
    cacheKey = '',
    cacheSync,
    defaultData
  } = {}) {
    if (defaultData) {
      this.data = defaultData
    }
    if (cache && cacheKey) {
      this.cache = new Cache({
        key: cacheKey,
        sync: cacheSync,
        defaultData
      })
      this.cache.event.on((status, data) => {
        if (status && data) {
          this.data = {
            ...this.data,
            ...data
          }
          this.event.trigger(this.data, 'cache')
        } else {
          this.event.trigger(this.data, 'no-cache')
        }
        this.cacheStatus = true
      }, true)
    }
  }

  // 缓存对象
  cache

  // 事件对象
  event = new QuickEvent()

  data = {}

  static getInstance() {
    if (!this.instance) {
      this.instance = new this()
    }
    return this.instance
  }

  async getDataAsync() {
    if (!this.cache || this.cacheStatus) {
      return this.data
    }
    return new Promise(resolve => {
      const { remove } = this.cache.event.on(() => {
        remove()
        resolve(this.data)
      })
    })
  }

  // 监听选中项改变事件
  onSet(callback, noCache, onLast) {
    return this.event.on((data, type) => {
      (noCache || type !== 'no-cache') && callback(data, type)
    }, onLast)
  }

  // 替换数据
  set(data) {
    if (typeof data === 'function') {
      this.data = data(this.data)
    } else {
      this.data = data
    }
    this.cache?.set(this.data)
    this.event.trigger(this.data, 'set')
  }

  // 合并并设置数据
  merge(data) {
    if (typeof data === 'function') {
      data = data(this.data)
    }
    this.set({
      ...this.data,
      ...data
    })
  }

  // 清除数据
  clear() {
    this.data = {}
    this.event.trigger(this.data, 'clear')
    this.cache?.set(this.data)
  }

  // 使用数据
  useData(key) {
    const [data, setData] = useState(key ? this.data[key] : this.data)

    const { remove } = useMemo(() => {
      return this.onSet(res => {
        if (key) {
          setData(res[key])
        } else {
          setData(res)
        }
      })
    }, [key])

    useEffect(() => {
      return () => remove()
    }, [remove])

    return data
  }
}
