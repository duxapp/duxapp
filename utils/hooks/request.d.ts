import { Request } from '../net'

declare namespace RequestHooks {
  interface RequestConfig {
    /**
       * 返回数据的回调，你在函数中返回的数据将作为此hook的结果
       * @param result
       * @returns
       */
    detailCallback?: (result: object) => object
    /**
     * 默认数据
     */
    defaultData?: any
    /**
     * 在返回的数据中用这个key取值
     */
    field?: string
    /**
     * 请求错误回调
     * @param err
     * @returns
     */
    onError?: (err: any) => void
    /**
     * 在页面显示的时候刷新数据
     */
    reloadForShow?: boolean
    /**
     * 启用缓存
     */
    cache?: boolean
    /**
     * 是否准备好，如果此参数为false，将不会发起请求
     */
    ready?: boolean
  }

  interface RequestResult {
    /**
     * 是否正在请求数据
     */
    loading: boolean
    /**
     * 重新加载数据
     * @returns
     */
    reload: () => Promise<{}>
    /**
     * 同useState()返回的的第二个参数
     * @param value
     * @returns
     */
    setData: (value: any | ((old: any) => any)) => void
  }

  interface PageDataConfig {
    /**
       * list用的字段
       */
    field?: string
    /**
     * 列表回调
     * @param list 列表
     * @param result 请求返回值
     * @returns
     */
    listCallback?: (list: any[], result: any) => any[]
    /**
     * 启用缓存
     * 会缓存第一页的内容
     */
    cache?: boolean
    /**
     * 是否准备好，如果此参数为false，将不会发起请求
     */
    ready?: boolean
    /**
     * 默认列表数据
     */
    defaultListData?: any[]
  }

  interface PageDataResult {
    /**
         * 是否正在请求数据
         */
    loading: boolean
    /**
     * 是否正在下拉刷新
     */
    refresh: boolean
    /**
     * 获取下一页数据
     * @returns
     */
    next: () => void
    /**
     * 跳转到第一个页并重新加载数据
     * @returns
     */
    reload: () => Promise<{}>

    /**
     * 设置列表数据 useState 返回的第二个值
     * @returns
     */
    setList: (value: any[] | ((oldState: any[]) => any[])) => void
  }
}

export function createRequestHooks(request: () => Promist<any>): {
  /**
   * request请求封装成hook
   * @param option 请求函数的参数
   * @param config hook配置
   * @returns
   */
  useRequest: (
    option: Request.RequestOption,
    config: RequestHooks.RequestConfig
  ) => [any, RequestResult]

  usePageData: (
    url: Request.RequestOption,
    option?: RequestHooks.PageDataConfig
  ) => [any[], RequestHooks.PageDataResult]
}
