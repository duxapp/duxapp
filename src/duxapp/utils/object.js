

/**
 * 递归设置value
 * @param {array} keys key数组
 * @param {object|array} data 被设置的对象
 * @param {any} value 要设置的值
 * @param {string} child 在递归时要调用的子集字段
 * @param {boolean} splice 是否使用splice插入数据 仅支持数组
 */
const recursionSetValue = (keys, data, value, childKey, splice = false) => {
  keys = typeof keys === 'string' ? keys.split('.') : [...keys]
  if (keys.length === 1) {
    if (splice) {
      data.splice(keys[0], 0, value)
    } else {
      data[keys[0]] = value
    }
  } else {
    if (childKey && data[keys[0]][childKey] === undefined) {
      data[keys[0]][childKey] = []
    }
    // 重写child
    let child = (childKey ? data[keys[0]][childKey] : data[keys[0]])
    if (!child) {
      child = typeof childKey === 'number' ? [] : {}
      if (!childKey) {
        data[keys[0]] = child
      } else {
        data[keys[0]][childKey] = child
      }
    }

    recursionSetValue(keys.slice(1), child, value, childKey, splice)
  }
}

/**
 * 递归获取value
 * @param {array} keys key数组
 * @param {object|array} data 被获取的对象
 * @param {string} childKey 在递归时要调用的子集字段
 * @param {boolean} splice 是否将此值删除 仅支持数组
 */
const recursionGetValue = (keys, data = {}, childKey, splice = false) => {
  keys = typeof keys === 'string' ? keys.split('.') : [...keys]
  if (keys.length === 0) {
    return false
  } if (keys.length === 1) {
    return splice ? data.splice(keys[0], 1)[0] : data[keys[0]]
  } else {
    return recursionGetValue(keys.slice(1), childKey === undefined ? data[keys[0]] : data[keys[0]][childKey], childKey, splice)
  }
}

/**
 * 检查一个值是否在给定的数组中 不在这返回指定的默认value
 * @param {any} value
 * @param {array} array
 * @param {any} defaultValue
 */
const verifyValueInArray = (value, array, defaultValue = array[0]) => {
  if (!value) return defaultValue
  if (array.indexOf(value) !== -1) return value
  return defaultValue
}

/**
 * 对象深拷贝
 * @param {*} source 要拷贝的对象
 * @returns
 */
const deepCopy = source => {
  if (!(source instanceof Object)) return source //如果不是对象的话直接返回
  const target = Array.isArray(source) ? [] : {} //数组兼容
  for (const k in source) {
    if (source.hasOwnProperty(k)) {
      if (typeof source[k] === 'object') {
        target[k] = deepCopy(source[k])
      } else {
        target[k] = source[k]
      }
    }
  }
  return target
}

export {
  recursionSetValue,
  recursionGetValue,
  verifyValueInArray,
  deepCopy
}
