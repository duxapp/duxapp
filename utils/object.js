/**
 * 递归获取value
 * @param {array} keys key数组
 * @param {object|array} data 被获取的对象
 * @param {string} childKey 在递归时要调用的子集字段
 * @param {boolean} splice 是否将此值删除 仅支持数组
 */
const recursionGetValue = (keys, data = {}, childKey, splice = false) => {
  if (typeof keys === 'undefined') {
    return data
  }
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

const deepEqua = (data1, data2) => {
  if (data1 === data2) {
    return true
  } else if (data1 !== null && data2 !== null && (typeof data1 !== 'object' || typeof data2 !== 'object')) {
    return false
  } else if (data1 === null || data2 === null) {
    return data1 === data2
  }
  const keys = [Object.keys(data1), Object.keys(data2)]
  if (keys[0].length !== keys[1].length) {
    return false
  }
  return keys[0].every(key => {
    const vals = [data1[key], data2[key]]
    if (vals[0] === vals[1]) {
      return true
    } else if (vals[0] && typeof vals[0] === 'object' && vals[1] && typeof vals[1] === 'object') {
      return deepEqua(...vals)
    } else {
      return false
    }
  })
}

export {
  recursionGetValue,
  deepCopy,
  deepEqua
}
