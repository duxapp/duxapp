import { ReactNode } from 'react'
import { ViewProps } from '@tarojs/components'

interface LayoutProps extends ViewProps {
  /** 重载组件的 key，用于重新计算布局尺寸 */
  reloadKey?: string | number;
  /** 在布局发生变化时的回调函数 */
  onLayout?: (layout: {
    /** 宽度 */
    width: number
    /** 高度 */
    height: number
    /** 距离屏幕左侧的位置 */
    left: number
    /** 距离屏幕顶部的位置 */
    top: number
  }) => void;
}

/**
 * 获取组件的布局尺寸信息
 * @param props 组件属性
 * @returns JSX.Element
 */
export function Layout(props: LayoutProps): JSX.Element;
