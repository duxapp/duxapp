import { Component, isValidElement, cloneElement } from 'react'
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
    const { modal, mask = modal } = this.props
    if (mask) return
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
      {/* <View className='absolute bg-success bottom-0 left-0 h-full w-full'></View> */}
      {masking && <View
        className='PullView'
        style={{
          backgroundColor: show ? `rgba(0, 0, 0, ${overlayOpacity})` : 'rgba(0, 0, 0, 0)'
        }}
        onClick={this.overlayCilck}
      />}
      <View
        className={`PullView__main PullView__main--${side}${show ? ' PullView__main--show' : ''}`}
        style={style}
      >
        {
          isValidElement(children) ?
            cloneElement(children, {
              style: {
                ...children.props.style,
                ...side === 'bottom' || side === 'top' ? { width: '100%' } : { height: '100%' }
              }
            }) :
            children
        }
      </View>
    </Absolute>
  }
}
