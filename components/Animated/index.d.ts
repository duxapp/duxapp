import { createAnimation, Animation as TaroAnimation } from '@tarojs/taro'
import { ViewProps } from '@tarojs/components'
import { ComponentType } from 'react'

type Option = {
  /** 动画持续时间，单位 ms */
  duration?: number
  /** 动画的效果 */
  timingFunction?: keyof TimingFunction
  /** 动画延迟时间，单位 ms
   * @default 0
   */
  delay?: number
  /** @default "50% 50% 0" */
  transformOrigin?: string
  /**
   * 单位
   * @supported h5
   */
  unit?: string
}

export const Animated: {
  create: (option: Option) => TaroAnimation,
  View: ComponentType<ViewProps>,
  defaultState: any
}
