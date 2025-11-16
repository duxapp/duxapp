import { QuickEvent } from './QuickEvent'

/**
 * 缓存处理类
 */
export declare class Cache<T = any> {
  constructor(options: {
    key: string
    defaultData?: T,
    sync?: boolean
  })

  /** 当前数据 */
  data: T

  /** 配置信息 */
  config: {
    key: string
    readStatus: boolean
  }

  /** 事件对象 */
  event: QuickEvent

  /** 初始化读取本地存储 */
  init(): Promise<void>

  /** 设置数据 */
  set(data: T | ((prev: T) => T)): void

  /** 获取数据 */
  get(): T
}

/**
 * 管理对象数据，可选缓存本地
 * 并且通过hook动态更新数据
 */
export declare class ObjectManage<T = any> {
  constructor(options?: {
    cache?: boolean
    cacheKey?: string
    /**
     * 同步获取本地缓存（警告：请只把少量的重要数据使用同步获取，例如获取用户信息，不然会导致启动缓慢）
     * 仅小程序 H5支持
     */
    cacheSync?: boolean,
    /**
     * 如果要设置默认数据，特别是cacheSync为true的情况下，一定要通过 defaultData 指定默认数据 而不是在当前类直接指定data
     */
    defaultData?: T
  })

  /** 当前数据 */
  data: T

  /** 缓存对象 */
  cache?: Cache<T>

  /** 事件对象 */
  event: QuickEvent

  /**
   * 获取当前唯一实例
   * 使用这个方法，就不需要 new 一个对象导出
   * 可以用作优化：在使用时才读取缓存，会在第一次调用 getInstance() 方法的时候初始化对象实例
   * @example
   * XX 是你自己创建的类
   * XX.getInstance().getDataAsync().then(data => {}) // 异步获取数据，因为获取本地缓存是异步的，所以需要使用异步获取，而不是直接读取data
   * const data = XX.getInstance().useData() // hook中调用数据
   * XX.getInstance().merge({ test: 1 }) // 合并数据
   */
  static getInstance<T extends ObjectManage>(): T

  /**
   * 监听数据变化
   * @param callback 如果cacheSync为true，在小程序端或者H5端这个函数可能会被同步执行(type 为 cache 或者 no-cache 时是同步的)
   * @param noCache 传入 true 才会返回 no-cache 类型
   * @param onLast 是否监听事件的最后一条数据
   */
  onSet(callback: (
    data: T, type: 'set' | 'cache' | 'clear' | 'no-cache') => void,
    noCache?: boolean,
    onLast?: boolean
  ): { remove(): void }

  /** 设置数据 */
  set(data: T | ((prev: T) => T)): void

  /** 将设置的数据合并之后，设置进去 */
  merge(data: T | ((prev: T) => T)): void

  /** 清除数据 */
  clear(): void

  /** 异步获取data数据，主要用于在缓存还未读取之前调用的话，确保返回缓存data */
  getDataAsync?: () => Promise<T>

  /**
   * React Hook：组件中使用数据
   * @param key 传入参数和指定使用数据的某个字段
   * 获取单个字段有利于优化渲染，只有这个字段发生变化，才会触发更新
   */
  useData(key?: string): T
}
