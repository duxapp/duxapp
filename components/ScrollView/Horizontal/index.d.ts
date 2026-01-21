import { ComponentType } from 'react'
import { ScrollViewProps } from '@tarojs/components/types/ScrollView'

export interface ScrollViewHorizontalProps extends ScrollViewProps {
  className?: string
}

export const Horizontal: ComponentType<ScrollViewHorizontalProps>
