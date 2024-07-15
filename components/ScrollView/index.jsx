import { Component } from 'react'
import classNames from 'classnames'
import { ScrollView as TaroScrollView, View } from '@tarojs/components'
import { Horizontal } from './Horizontal'
import './index.scss'

export class ScrollView extends Component {

  static Horizontal = Horizontal

  refresh() {
    const { refresh } = this.props
    !refresh && this.props.onRefresh?.()
  }

  render() {
    const {
      style = {},
      refresh,
      scrollWithAnimation = true,
      className,
      flip = false,
      ...props
    } = this.props

    return <View className={classNames('scroll-root', className)} style={style}>
      <TaroScrollView
        type='list'
        scrollY
        className={classNames(
          'scroll-auto-height-weapp scroll',
          flip && 'scroll-flip'
        )}
        scrollWithAnimation={scrollWithAnimation}
        refresherEnabled={refresh !== undefined}
        refresherThreshold={50}
        onRefresherrefresh={this.refresh.bind(this)}
        refresherTriggered={!!refresh}
        refresherBackground='transparent'
        enhanced
        showScrollbar={false}
        {...props}
      >
        {this.props.children}
      </TaroScrollView>
    </View>
  }
}
