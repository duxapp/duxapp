import { Component } from 'react'
import classNames from 'classnames'
import { ScrollView as TaroScrollView, View } from '@tarojs/components'
import './index.scss'

export class ScrollView extends Component {

  scroll(e) {
    this.props.onScroll && this.props.onScroll(e)
  }

  scrollToLower(e) {
    this.props.onScrollToLower && this.props.onScrollToLower(e)
  }

  refresh() {
    const { refresh } = this.props
    !refresh && this.props.onRefresh?.()
  }

  refreshReset() {
  }

  reload() {
    this.props.onReload && this.props.onReload()
  }

  render() {
    const {
      style = {},
      refresh,
      scrollWithAnimation = true,
      scrollTop,
      className,
      flip = false
    } = this.props

    return <View className={classNames('scroll-root', className)} style={style}>
      <TaroScrollView
        type='list'
        scrollY
        className={classNames(
          'scroll-auto-height-weapp scroll',
          flip && 'scroll-flip'
        )}
        onScroll={this.scroll.bind(this)}
        onScrollToLower={this.scrollToLower.bind(this)}
        scrollWithAnimation={scrollWithAnimation}
        scrollTop={scrollTop}
        refresherEnabled={refresh !== undefined}
        refresherThreshold={50}
        onRefresherrefresh={this.refresh.bind(this)}
        onRefresherrestore={this.refreshReset.bind(this)}
        refresherTriggered={!!refresh}
        refresherBackground='transparent'
      >
        {this.props.children}
      </TaroScrollView>
    </View>
  }
}
