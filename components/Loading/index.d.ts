import { ComponentType } from 'react'
import { ViewProps } from '@tarojs/components'

interface color {
  /** 深色 #7a7a7a */
  dark
  /** 白色 #fff */
  blank
}

interface LoadingProps extends ViewProps {
  /** loading颜色 */
  color?: keyof color,
  /** loading尺寸 */
  size?: number
}

/**
 * 菊花loading动画 三端统一
 * @example <Loading size={60} />
 * @info size不支持动态更改，只会渲染其初始值
 */
export const Loading: ComponentType<LoadingProps>
