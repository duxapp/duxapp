import { ScrollViewProps } from '@tarojs/components'
import { Component, ReactElement, CSSProperties, FC } from 'react'
import { Request } from '../../utils/net'
import { RequestHooks } from '../../utils/hooks/request'

interface ListProps extends ScrollViewProps {
  /** 请求url 和 request的url相同 */
  url: string
  /** 每一项的渲染组件 */
  renderItem: Component
  /** 请求参数 request 的data */
  data?: {
    [key]: any
  }
  /** 其他的请求参数 */
  requestOption?: Request.RequestOption
  /** 是否有分页，没有分页的接口可以设置false，默认true */
  page?: boolean
  /** 是否开启缓存 */
  cache?: boolean
  /**
   * 接口返回的列表字段 默认list
   * 如果指定的字段不存在，会判断上一级是不是数组，如果是就使用上一级作为列表
   */
  listField?: string
  /** 列表项的key 默认id */
  keyField?: string
  /** 请求回调函数 可以从这里获请求中的数据 需要返列表数据 */
  listCallback?: (list: any[], result: any) => any[]
  /** 是否在页面显示出来的时候刷新数据 */
  reloadForShow?: boolean | {
    // 传入一个展示的钩子
    useShow: () => void
  }
  /** 传给 usePageData 的第二个参数 */
  option: RequestHooks.PageDataConfig
  /**
   * 列数 默认1
   * 这是对RN端的配置，其他端需要使用 listStyle 或者 listClassName去实现
   */
  columns?: number
  /** 插入头部的内容 */
  renderHeader?: ReactElement
  /** 插入底部的内容 */
  renderFooter?: ReactElement
  /** 每一项的分割线 */
  renderLine?: ReactElement
  /** 列表为空时显示的内容 这里存在一个默认值 */
  renderEmpty?: ReactElement
  /** 未指定renderEmpty时 的空标题 */
  emptyTitle?: string
  /** 未指定renderEmpty时 空内容的点击事件 */
  onEmptyClick?: () => void
  /**
   * usePageData 的action回调
   * 获取这个回调之后你可以用来手动刷新数据
   * 可以直接将一个ref值赋值给这个属性
   */
  onAction?: (action: RequestHooks.PageDataResult) => void
  /** 除了RN端，其他端应用于列表上的样式，可以用于实现多列布局 */
  listStyle?: CSSProperties
  /** 除了RN端，其他端应用于列表上的样式，可以用于实现多列布局 */
  listClassName?: string
}

export function createList(
  usePageList: (
    url: Request.RequestOption,
    option?: RequestHooks.PageDataConfig
  ) => [any[], RequestHooks.PageDataResult]
): FC<ListProps>
