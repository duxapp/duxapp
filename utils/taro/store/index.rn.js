import { createMMKV } from 'react-native-mmkv'

const mmkv = createMMKV({
  id: 'duxapp'
})

const getKeyFromArg = (arg) => {
  if (typeof arg === 'string') {
    if (!arg) throw new Error('storage key 必须是非空字符串')
    return arg
  }
  if (arg && typeof arg === 'object' && typeof arg.key === 'string') {
    if (!arg.key) throw new Error('storage key 必须是非空字符串')
    return arg.key
  }
  throw new Error('storage key 必须是字符串')
}

const getDataFromArg = (arg) => {
  if (!arg || typeof arg !== 'object') {
    throw new Error('setStorage 参数必须是对象 { key, data }')
  }
  const { key, data } = arg
  if (typeof key !== 'string' || !key) throw new Error('storage key 必须是非空字符串')
  return { key, data }
}

const serialize = (value) => {
  if (typeof value === 'string') return value
  if (typeof value === 'undefined') throw new Error('storage data 不能是 undefined')
  return JSON.stringify(value)
}

export const getStorageSync = (key) => {
  const storageKey = getKeyFromArg(key)
  return mmkv.getString(storageKey)
}

export const setStorageSync = (options) => {
  const { key, data } = getDataFromArg(options)
  mmkv.set(key, serialize(data))
}

export const removeStorageSync = (key) => {
  const storageKey = getKeyFromArg(key)
  mmkv.remove(storageKey)
}

export const clearStorageSync = () => {
  mmkv.clearAll()
}

export const getStorageInfoSync = () => {
  const keys = mmkv.getAllKeys()
  return {
    keys,
    currentSize: Math.ceil(mmkv.size / 1024),
    limitSize: Infinity
  }
}

export const getStorage = (options) => {
  const storageKey = getKeyFromArg(options)
  return new Promise((resolve, reject) => {
    const res = { errMsg: 'getStorage:ok' }
    try {
      const raw = mmkv.getString(storageKey)
      if (typeof raw === 'undefined') {
        reject({ errMsg: 'getStorage:fail data not found' })
        return
      }
      let data = raw
      try {
        data = JSON.parse(raw)
      } catch (e) {
        data = raw
      }
      resolve({ data, ...res })
    } catch (error) {
      reject({ errMsg: error?.message || String(error) })
    }
  })
}

export const setStorage = (options) => {
  return new Promise((resolve, reject) => {
    const res = { errMsg: 'setStorage:ok' }
    try {
      setStorageSync(options)
      resolve(res)
    } catch (error) {
      reject({ errMsg: error?.message || String(error) })
    }
  })
}

export const removeStorage = (options) => {
  const storageKey = getKeyFromArg(options)
  return new Promise((resolve, reject) => {
    const res = { errMsg: 'removeStorage:ok' }
    try {
      mmkv.remove(storageKey)
      resolve(res)
    } catch (error) {
      reject({ errMsg: error?.message || String(error) })
    }
  })
}

export const clearStorage = () => {
  return new Promise((resolve, reject) => {
    const res = { errMsg: 'clearStorage:ok' }
    try {
      mmkv.clearAll()
      resolve(res)
    } catch (error) {
      reject({ errMsg: error?.message || String(error) })
    }
  })
}

export const getStorageInfo = () => {
  return new Promise((resolve, reject) => {
    const res = { errMsg: 'getStorageInfo:ok' }
    try {
      resolve({
        ...getStorageInfoSync(),
        ...res
      })
    } catch (error) {
      reject({ errMsg: error?.message || String(error) })
    }
  })
}
