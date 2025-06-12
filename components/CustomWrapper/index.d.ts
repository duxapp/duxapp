import { ComponentType } from 'react'
import { CustomWrapper as TaroCustomWrapper } from '@tarojs/components'

interface CustomWrapperProps extends TaroCustomWrapper {
  /**
   * 传入自定义id，可以用传入的id获取 CustomWrapper 实例
   */
  id?: string
}

export const CustomWrapper: ComponentType<CustomWrapperProps>
