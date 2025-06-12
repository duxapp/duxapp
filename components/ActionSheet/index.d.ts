import { ComponentType } from 'react'

interface ActionSheetProps {

}

export const ActionSheet: ComponentType<ActionSheetProps> & {
  show: (option: {
    /**
     * 选择标题
     */
    title?: string
    /**
     * 选项
     */
    list: sting[]
  }) => Promise<{
    /**
     * 选中的项目
     */
    item: string
    /**
     * 选中项目的索引
     */
    index: number
  }>
}
