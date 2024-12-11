import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { QuickEvent } from '../QuickEvent'
import { deepEqua } from '../object'

export const createGlobalState = defaultData => {

  const event = new QuickEvent()

  let newData = defaultData

  return {
    useState: () => {

      const [data, setData] = useState(newData)

      const { remove } = useMemo(() => event.on(setData), [])

      useEffect(() => () => remove(), [remove])

      return data
    },
    setState: data => {

      newData = typeof data === 'function' ? data(newData) : data

      event.trigger(newData)
    }
  }
}

/**
 * 修复单词错误，兼容错误写法
 * 2024-10-15
 */
export const creatGlobalState = createGlobalState

export const createContextState = () => {

  const context = createContext([void 0, () => console.error('setState 方法不在 Provider 作用域内')])

  return {
    useState: () => {
      return useContext(context)
    },
    Provider: ({ value: _value, defaultValue, children }) => {

      const value = useState(_value ?? defaultValue)

      useMemo(() => {
        if (typeof _value !== 'undefined' && value[0] !== _value) {
          value[1](_value)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [_value])

      return <context.Provider value={value}>
        {children}
      </context.Provider>
    }
  }
}

/**
 * 修复单词错误，兼容错误写法
 * 2024-10-15
 */
export const creatContextState = createContextState

export const contextState = createContextState()

export const useDeepObject = data => {
  const _data = useRef(data)

  const result = useMemo(() => {
    if (!deepEqua(_data.current, data)) {
      _data.current = data
    }
    return _data.current
  }, [data])

  return result
}

export const useForceUpdate = () => {
  const [, setState] = useState()
  return useCallback(() => setState(old => !old), [])
}
