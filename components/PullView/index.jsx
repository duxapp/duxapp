import { Component } from 'react'
import { View } from '@tarojs/components'
import { asyncTimeOut } from '@/duxapp/utils'
import { Absolute } from '../Absolute'
import './index.scss'

export class PullView extends Component {

  state = {
    show: false
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        show: true
      })
    }, 10)
  }

  overlayCilck = () => {
    const { modal } = this.props
    if (modal) return
    this.close()
  }

  async close() {
    this.setState({
      show: false
    })
    await asyncTimeOut(200)
    this.props.onClose?.()
  }

  render() {
    const { show } = this.state
    const { side = 'bottom', style = {}, overlayOpacity = 0.5, children, masking = true, group } = this.props
    return <Absolute group={group}>
      {masking && <View
        className='PullView'
        style={{ backgroundColor: show ? `rgba(0, 0, 0, ${overlayOpacity})` : 'rgba(0, 0, 0, 0)' }}
        onClick={this.overlayCilck}
      />}
      <View
        className={`PullView__main PullView__main--${side}${show ? ' PullView__main--show' : ''}`}
        style={style}
      >
        {children}
      </View>
    </Absolute>
  }
}
