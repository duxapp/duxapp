import React, { Component, cloneElement, memo, useCallback, createContext, useContext, isValidElement, Children } from 'react'
import { getCurrentInstance } from '@tarojs/taro'
import { View } from '@tarojs/components'
import classNames from 'classnames'
import { isIphoneX, route, theme } from '@/duxapp/utils'
import { QuickEvent } from '@/duxapp/utils/QuickEvent'
import { KeyboardAvoiding } from '../KeyboardAvoiding'
import { Status } from './Status'
import { WeappRem } from './WeappRem'
import './index.scss'
import '../../userTheme/index.scss'

export class TopView extends Component {

  // eslint-disable-next-line react/sort-comp
  static keyValue = 0

  // 当前页面的KEY
  static pageKey = 0

  // 记录路由的keys 最后一个就是当前路由
  static pageKeys = []

  static getCurrentPageKey = () => this.pageKeys[this.pageKeys.length - 1]

  static event = new QuickEvent()

  static group = (() => {
    const data = {}
    return {
      getList: (page, group) => {
        if (!group) {
          return
        }
        const key = `${page}-${group}`
        if (!data[key]) {
          data[key] = []
        }
        return data[key]
      },
      removePage: page => {
        Object.keys(data).forEach(key => {
          if (key.startsWith(page + '-')) {
            delete data[key]
          }
        })
      }
    }
  })()

  static add = (element, option = {}) => {

    const page = option.page ?? this.getCurrentPageKey()
    const key = ++this.keyValue
    const group = this.group.getList(page, option.group)
    if (option.group) {
      group.push({ key, element })
      if (group.length === 1) {
        this.event.trigger(page + '-add', group[0])
      }
    } else {
      this.event.trigger(page + '-add', { key, element })
    }

    return {
      key,
      update: el => {
        if (option.group) {
          const index = group.findIndex(v => v.key === key)
          if (!~index) {
            return
          }
          if (!index) {
            this.event.trigger(page + '-add', { key, element: el })
          } else {
            group[index].element = el
          }
        } else {
          this.event.trigger(page + '-add', { key, element: el })
        }
      },
      remove: () => {
        if (option.group) {
          const index = group.findIndex(v => v.key === key)
          if (!~index) {
            return
          }
          group.splice(index, 1)
          if (!index) {
            // 关闭后将新的元素插入
            this.event.trigger(page + '-remove', { key }, group[0])
          }
        } else {
          this.event.trigger(page + '-remove', { key })
        }
      }
    }
  }

  static removeAll = (page = this.getCurrentPageKey()) => {
    this.group.removePage(page)
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

  static HOC = (...args) => {
    console.warn('即将被弃用:TopView.HOC()，修改为：TopView.page()')
    return this.page(...args)
  }

  static page = (Page, props) => {
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

const Position = ({ children }) => {
  return process.env.TARO_ENV === 'rn' || process.env.TARO_ENV === 'harmony_cpp'
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

  if (
    item.element instanceof Array
    && !React.isValidElement(item.element[0])
    && (typeof item.element[0] === 'function' || typeof item.element[0] === 'object')
  ) {
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

    this.eventOff = TopView.event.on((name, e, ...args) => {
      if (name === page + '-add') {
        this.add(e, ...args)
      } else if (name === page + '-remove') {
        this.remove(e, ...args)
      } else if (name === page + '-removeAll') {
        this.removeAll(e, ...args)
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

  remove = (e, add) => {
    const { elements } = this.state
    const index = elements.findIndex(v => v.key === e.key)
    if (~index) {
      elements.splice(index, 1)
      this.setState({ elements })
    }
    if (add) {
      this.add(add)
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
    // 执行到最后，执行默认children
    return Children.map(children, child => {
      if (child.type === KeyboardAvoiding) {
        const Page = child.props.children
        // 如果传入的页面是一个未初始化的组件则执行这个组件
        if (typeof Page === 'function') {
          return cloneElement(child, {}, <Page />)
        }
      }
      return child
    })
  }
  const Item = item.component
  return <Item {...item.props}>
    <Container index={index + 1}>{children}</Container>
  </Item>
}

const TopViewFunc = ({ pageKey, children, isSafe, isForm, className, ...props }) => {

  const mode = theme.useMode()

  return <>
    <WeappRem />
    <View
      className={classNames(
        'TopView',
        className,
        `duxapp-theme-${mode}`,
        {
          'TopView--safe': isSafe && isIphoneX()
        }
      )}
      {...props}
    >
      <Status barStyle='dark-content' />
      <Container>
        <KeyboardAvoiding enabled={!!isForm}>
          {children}
        </KeyboardAvoiding>
        <CreateEle page={pageKey} />
      </Container>
    </View>
  </>
}
