export class RenderHook {
  /**
   * 注册钩子
   * 传入钩子的子元素是默认元素，当调用 payHook.add 方法之后默认元素将被覆盖
   * @example
   * <payHook.Render mark='mark' option={{ price }}>
   *   <Text size={4} bold>需支付：￥{price}</Text>
   * </payHook.Render>
   * <payHook.Render mark='mark' option={{ price }}>{Text}</payHook.Render>
   * <payHook.Render mark='mark' option={{ price }} />
   */
  Render: (props: {
    /** 钩子唯一标识 */
    mark: string
    /** 传递给插入此钩子的组件的参数 */
    option?: {
      [any]: any
    }
    /** 最多允许显示多少个插入的钩子 */
    max?: number
    children?: JSX.Element
  }) => JSX.Element

  /**
   * hook获取添加的钩子
   */
  useMark: (mark: string, type?: 'self' | 'before' | 'after' | 'container' = 'self') => any[]

  /**
   * 获取添加的钩子
   */
  getMark: (mark: string, type?: 'self' | 'before' | 'after' | 'container' = 'self') => any[]

  /**
   * 添加一个或多个钩子
   * 可以将组件直接传入，也可以传入渲染后的内容
   * 需要注意的是只有传入未渲染的组件才能获取到钩子传入的option参数
   * @example
   * payHook.add('mark', props => {
   *  // props 为注册钩子时传入的option <payHook.Render mark='mark' option={{ name: '名称' }} />
   *  return <Text>{props.name}</Text>
   * })
   * payHook.add('mark', <Text>内容</Text>)
   */
  add: (mark: string, ...element: any[]) => void
  /**
   * 添加一个或多个钩子 此方法添加的元素将显示在钩子的前面
   */
  addBefore: (mark: string, ...element: any[]) => void
  /**
   * 添加一个或多个钩子 此方法添加的元素将显示在钩子的后面
   */
  addAfter: (mark: string, ...element: any[]) => void
  /**
   * 添加一个或多个容器钩子
   * 这些容器是一个组件，可以套在此标记的外层，并控制这个标记的子元素
   * @example
   * payHook.addContainer('mark', ({ children }) => {
   *  return <View>{children}</View>
   * })
   */
  addContainer: (mark: string, ...element: any[]) => void
}

export const duxappHook: RenderHook
