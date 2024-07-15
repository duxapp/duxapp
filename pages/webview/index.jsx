import { Component } from 'react'
import { getCurrentInstance } from '@tarojs/taro'
import { decodeParams } from '@/duxapp/utils'
import WeebviewComp from './common/webview'
import './index.scss'

export default class WebViewPage extends Component {

  $instance = getCurrentInstance().router

  render() {
    const params = decodeParams(this.$instance.params)
    return <WeebviewComp url={params.url} />
  }
}
