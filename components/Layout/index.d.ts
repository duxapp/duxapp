import { ReactNode } from 'react'
import { ViewProps } from '@tarojs/components'

/**
 * 获取元素尺寸的工具函数
 * @param select 选择器
 * @param getAll 是否获取全部元素
 * @param num 请求次数（默认最多请求10次）
 * @returns Promise
 */
export function getRect(select: string, getAll?: boolean, num?: number): Promise<any>;

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
