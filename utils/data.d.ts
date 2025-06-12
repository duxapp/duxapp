import { QuickEvent } from './QuickEvent'

/**
 * 缓存处理类
 */
export declare class Cache<T = any> {
  constructor(options: {
    key: string
    defaultData?: T
  })

  /** 当前数据 */
  data: T

  /** 配置信息 */
  config: {
    key: string
    readStatus: boolean
  }

  /** 本地事件对象 */
  localEvent: QuickEvent

  /** 初始化读取本地存储 */
  init(): Promise<void>

  /** 设置数据 */
  set(data: T | ((prev: T) => T)): void

  /** 获取数据 */
  get(): T

  /** 监听读取本地数据 */
  onLocal(callback: (status: boolean, data?: T) => void): { remove(): void }

  /** 异步获取数据（等待缓存读取完成） */
  getAsync(): Promise<T>
}

/**
 * 管理对象数据，可选缓存本地
 * 并且通过hook动态更新数据
 */
export declare class ObjectManage<T = any> {
  constructor(options?: {
    cache?: boolean
    cacheKey?: string
    defaultData?: T
  })

  /** 当前数据 */
  data: T

  /** 缓存对象 */
  cache?: Cache<T>

  /** 事件对象 */
  quickEvent: QuickEvent

  /** 设置监听 */
  onSet(callback: (data: T, type: 'set' | 'cache' | 'clear') => void): { remove(): void }

  /** 设置数据 */
  set(data: T | ((prev: T) => T)): void

  /** 清除数据 */
  clear(): void

  /** React Hook：组件中使用数据 */
  useData(): T
}
