import { Component } from 'react'
import { WebView } from '@tarojs/components'
import { Header, TopView } from '@/duxapp/components'

export default class WebViewPage extends Component {

  render() {
    const { url } = this.props
    return <TopView>
      <Header />
      <WebView src={url} />
    </TopView>
  }
}
