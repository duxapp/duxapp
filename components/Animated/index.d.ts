import { createAnimation, Animation as TaroAnimation } from '@tarojs/taro'
import { ViewProps } from '@tarojs/components'

export const Animated: {
  create: (option: createAnimation.Option) => TaroAnimation,
  View: ViewProps,
  defaultState: any
}
