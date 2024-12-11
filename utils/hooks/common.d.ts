import { ComponentType, ReactNode } from 'react'

/**
 * 创建一个全局作用域的 state
 * @param initialState
 */
export function createGlobalState<S>(initialState: S): {
  useState: () => S
  setState: (value: S | ((prevState: S) => S)) => void
}

interface ContextStateProviderProps {
  /**
   * 可以通过外部改变的值
   */
  value?: any
  /**
   * 默认值不可改变的值
   */
  defaultValue?: any
  /**
   * 子元素
   */
  children: ReactNode
}

/**
 * 创建一个局部作用域的 state
 */
export function createContextState(): {
  useState: () => [any, (value: any | ((prevState: any) => any)) => void]
  Provider: ComponentType<ContextStateProviderProps>
}

/**
 * 创建一个局部作用域的 state
 */
export const contextState: {
  useState: () => [any, (value: any | ((prevState: any) => any)) => void]
  Provider: ComponentType<ContextStateProviderProps>
}

/**
 * 传入一个基本值或者对象，如果是对象，当这个对象的内容实际发生改变时，才返回改变的值
 * 其中不要包含复杂对象，这可能导致死循环，如果是函数需要用 useCallback 进行封装
 */
export const useDeepObject: (data: any) => any

/**
 * 用户函数组件里面的 forceUpdate
 */
export const useForceUpdate: () => () => void
