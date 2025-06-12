import { ScrollViewProps } from '@tarojs/components'
import { ScrollViewHorizontalProps } from './Horizontal'
import { ComponentType } from 'react'

interface DuxScrollViewProps extends ScrollViewProps {

  /** 下拉刷新状态 设置为true显示加载中 false不显示加载中 */
  refresh?: boolean

  /** 是否处于下拉刷新状态 */
  onRefresh?: () => any

  /** 180翻转内容 */
  flip?: boolean
}

/**
 * 自适应高度的滚动组件 支持设置下拉刷新 上拉加载
 * ```
 * @info 注意滚动组件是使用flex的自动最大宽度实现的 所以外层只能使用flex竖向布局 并且得具有固定高度
 */

export const ScrollView: ComponentType<DuxScrollViewProps> & {
  Horizontal: ComponentType<ScrollViewHorizontalProps>
}
