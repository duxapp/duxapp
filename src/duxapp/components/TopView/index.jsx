import React, { Component, cloneElement, memo, useCallback, createContext, useContext } from 'react'
import { getCurrentInstance } from '@tarojs/taro'
import { View } from '@tarojs/components'
import classNames from 'classnames'
import { isIphoneX, route } from '@/duxapp/utils'
import { QuickEvent } from '@/duxapp/utils/QuickEvent'
import { KeyboardAvoiding } from '../KeyboardAvoiding'
import { Status } from './Status'
import './index.scss'

const Position = ({ children }) => {
  return process.env.TARO_ENV === 'rn'
    ? children
    : <View className='position'>
      {children}
    </View>
}

const EleItem = memo(({
  item,
  onRemove
}) => {

  const remove = useCallback(() => {
    onRemove?.(item)
  }, [item, onRemove])

  if (item.element instanceof Array && !React.isValidElement(item.element[0])) {
    const [Item, props] = item.element
    return <Item {...props} onTopViewRemove={remove} />
  } else {
    return item.element
  }
})

class CreateEle extends Component {

  constructor(props) {
    super(props)
    const { page } = props

    this.eventOff = TopView.event.on((name, e) => {
      if (name === page + '-add') {
        this.add(e)
      } else if (name === page + '-remove') {
        this.remove(e)
      } else if (name === page + '-removeAll') {
        this.removeAll(e)
      }
    }).remove
  }

  state = {
    elements: []
  }

  componentWillUnmount() {
    this.eventOff()
  }

  add = e => {
    const { elements } = this.state
    const index = elements.findIndex(item => item.key === e.key)
    if (~index) {
      elements[index] = e
    } else {
      elements.push(e)
    }
    this.setState({ elements })
  }

  remove = e => {
    const { elements } = this.state
    const index = elements.findIndex(v => v.key === e.key)
    if (~index) {
      elements.splice(index, 1)
      this.setState({ elements })
    }
  }

  removeAll = () => {
    this.setState({ elements: [] })
  }

  render() {
    const { elements } = this.state
    return <Position>
      {
        elements.map(item => <EleItem key={item.key} item={item} onRemove={this.remove} />)
      }
    </Position>
  }
}

const Container = ({ index = 0, children }) => {
  const item = TopView.containers[index]
  if (!item) {
    const Page = children.props.children
    // 如果传入的页面是一个未初始化的组件则执行这个组件
    if (typeof Page === 'function') {
      return cloneElement(children, {}, <Page />)
    }
    return children
  }
  const Item = item.component
  return <Item {...item.props}>
    <Container index={index + 1}>{children}</Container>
  </Item>
}

const TopViewFunc = ({ pageKey, children, isSafe, isForm, className, ...props }) => {

  return <View
    className={classNames('TopView', className, { 'TopView--safe': isSafe && isIphoneX() })}
    {...props}
  >
    <Status barStyle='dark-content' />
    <Container>
      <KeyboardAvoiding isForm={isForm}>
        {children}
      </KeyboardAvoiding>
    </Container>
    <CreateEle page={pageKey} />
  </View>
}

export class TopView extends Component {

  // eslint-disable-next-line react/sort-comp
  static keyValue = 0

  // 当前页面的KEY
  static pageKey = 0

  // 记录路由的keys 最后一个就是当前路由
  static pageKeys = []

  static getCurrentPageKey = () => this.pageKeys[this.pageKeys.length - 1]

  static event = new QuickEvent()

  static add = (element, page = this.getCurrentPageKey()) => {

    const key = ++this.keyValue
    this.event.trigger(page + '-add', { key, element })

    return {
      update: el => this.update(key, el, page),
      remove: () => this.remove(key, page),
      key
    }
  }

  static update = (key, element, page = this.getCurrentPageKey()) => {
    key && this.event.trigger(page + '-add', { key, element })
  }

  static remove = (key, page = this.getCurrentPageKey()) => {
    key && this.event.trigger(page + '-remove', { key })
  }

  static removeAll = (page = this.getCurrentPageKey()) => {
    this.event.trigger(page + '-removeAll', {})
  }

  static containers = []

  /**
   * 添加一个容器，容器可以控制页面是否显示，以及重写子元素
   */
  static addContainer = (component, props = {}) => {
    const item = { component, props }
    this.containers.push(item)
    return {
      remove: () => {
        const index = this.containers.indexOf(item)
        if (~index) {
          this.containers.splice(index, 1)
        }
      }
    }
  }

  static HOC = (Page, props) => {
    const TopViewPage = () => {
      return <TopView {...props}>
        {Page}
      </TopView>
    }
    return TopViewPage
  }

  static context = createContext({
    setConfig: () => { }
  })

  static useContext = () => useContext(this.context)

  constructor(props) {
    super(props)
    TopView.pageKeys.push(this.pageKey)
  }

  componentWillUnmount() {
    route.pageUnmount(this.$instance)
    TopView.pageKeys.splice(TopView.pageKeys.indexOf(this.pageKey), 1)
  }

  $instance = getCurrentInstance().router

  // eslint-disable-next-line no-use-before-define
  pageKey = TopView.pageKey++

  render() {
    return <TopViewFunc {...this.props} pageKey={this.pageKey} />
  }
}
