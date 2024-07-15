import { Component } from 'react'
import { BackHandler } from 'react-native'
import { WebView as WebViewRn } from 'react-native-webview'
import { Header, TopView } from '@/duxapp/components'

export default class WebViewPage extends Component {

  state = {
    title: '',
    canGoBack: !1, // 是否可以回退
  }

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      const { canGoBack } = this.state
      if (canGoBack) {
        this.webview && this.webview.goBack()
        return true
      } else {
        return false
      }
    })
  }

  componentWillUnmount() {
    this.backHandler.remove()
  }

  change({ title, canGoBack }) {
    this.setState({
      title,
      canGoBack
    })
  }

  render() {
    const { title } = this.state
    const { url } = this.props
    return (
      <TopView>
        <Header title={title} />
        <WebViewRn
          ref={e => { this.webview = e }}
          source={{ uri: url }}
          onNavigationStateChange={this.change.bind(this)}
        />
      </TopView>
    )
  }
}
