import { ComponentType, ReactNode } from 'react'

/**
 * 创建一个全局作用域的 state
 * @param initialState
 */
export function creatGlobalState<S>(initialState: S): {
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
export function creatContextState(): {
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
 * 传入一个对象，当这个对象的内容实际发生改变时，才返回改变的值
 * @param data
 * @returns
 */
export const useDeepObject = (data: any) => any
