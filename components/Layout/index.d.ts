import { ComponentType } from 'react'
import { ViewProps } from '@tarojs/components'

export interface LayoutRect {
  width: number
  height: number
  left: number
  top: number
  right?: number
  bottom?: number
}

/**
 * 获取节点布局信息
 * @param select 选择器
 * @param getAll 是否获取全部匹配节点
 * @param scope 查询作用域（小程序/H5）
 */
export const getRect: (
  select: string,
  getAll?: boolean,
  scope?: any,
  num?: number
) => Promise<LayoutRect | LayoutRect[]>

interface LayoutProps extends ViewProps {
  /**
   * 重载组件的 key，用于重新计算布局尺寸
   * 除了RN不会在布局发生更改之后自动触发 onLayout 需要在合适的时机让，更新这个属性让他触发
   */
  reloadKey?: string | number;
  /** 在布局发生变化时的回调函数 */
  onLayout?: (layout: LayoutRect) => void
}

/**
 * 获取组件的布局尺寸信息
 * @param props 组件属性
 * @returns JSX.Element
 */
export const Layout: ComponentType<LayoutProps>
