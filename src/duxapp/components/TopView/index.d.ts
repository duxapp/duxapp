import { LegacyRef, ComponentType, Component, CSSProperties, ReactElement, ReactNode } from 'react'

interface TopViewProps {
  /**
   * 是否显示安全区域
   * @default false
  */
  isSafe: boolean
  /**
   * 是否是表单页面
   * @default false
  */
  isForm: boolean
  /**
   * 组件页面标识 不传默认读取当前页面的路由
   */
  pageUrl: string
  /** 顶层样式 */
  style: CSSProperties
  /** 样式类名 */
  className: string
  /** 引用 */
  ref?: LegacyRef<any>
}

interface AddAsyncTask extends Promise<AddAsyncTask> {

}
/**
 * 根节点 可以用于控制页面全局弹窗 下巴机型底部空白 键盘弹出控制
 * @noInheritDoc
 */
export class TopView extends Component<TopViewProps> {
  /**
   * 添加一个组件到全局
   * @param element 组件
   * @param page 标识 默认当前页面
   * @return 返回一个key，用于更新或者删除
   */
  static add(element: ReactElement, page?: string): number

  /**
   * 更新一个已经创建的组件
   * @param key 标识
   * @param element 元素
   * @param page 页面
   */
  static update(key: number, element: ReactElement, page?: string): void

  /**
   * 移除一个已经创建的组件
   * @param key 标识
   * @param page 页面
   */
  static remove(key: number, page?: string): void

  /**
   * 添加一个容器，容器可以控制页面是否显示，以及重写子元素
   * @param component 组件
   * @param props 传递给组件的属性
   */
  static addContainer(component: Component, props: object): {
    /**
     * 移除添加的容器，并不会实时生效，需要在下次渲染时生效
     * @returns
     */
    remove: () => void
  }

  /**
   * 移除所有添加的组件
   * @param page 页面
   */
  static removeAll(page?: string): void

  /**
   * 用高阶组件的形式包装页面
   * @param WrappedComponent 页面组件
   * @param props 传递给TopView组件的属性
   */
  static HOC(WrappedComponent?: ReactNode, props: TopViewProps): ReactNode
}
