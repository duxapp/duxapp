import { AudioPlayer, createAudioPlayer, AudioStatus } from 'expo-audio'

import { isUrl } from '@tarojs/taro-rn/src/utils'

/**
 * InnerAudioContext 实例，可通过 wx.createInnerAudioContext 接口获取实例。
 * 建议复用实例或使用池化策略，避免短时间内频繁创建导致音频会话被系统回收。
 */
class InnerAudioContext {
  private _src: string
  private _startTime: number
  private _autoplay = false
  // private
  private player: AudioPlayer
  private onCanplayCallbacks: Array<() => void> = []
  private onEndedCallbacks: Array<() => void> = []
  private onErrorCallbacks: Array<(error: any) => void> = []
  private onPauseCallbacks: Array<() => void> = []
  private onPlayCallbacks: Array<() => void> = []
  private onSeekedCallbacks: Array<() => void> = []
  private onSeekingCallbacks: Array<() => void> = []
  private onStopCallbacks: Array<() => void> = []
  private onTimeUpdateCallbacks: Array<() => void> = []
  private onWaitingCallbacks: Array<() => void> = []

  // 标记状态，用于事件回调
  private status = {
    endTime: 0,
    isBuffering: false,
    isLoaded: false
  }

  constructor({ useWebAudioImplement = false }) {
    this.player = createAudioPlayer(null, {
      downloadFirst: useWebAudioImplement
    })
    this.player.addListener('playbackStatusUpdate', this._onPlaybackStatusUpdate)
  }

  _onPlaybackStatusUpdate = (status: AudioStatus) => {
    if (!this.player) {
      return
    }
    if (!this.player.loop && status.didJustFinish && Date.now() - this.status.endTime > 10) {
      this.status.endTime = Date.now()
      this.onEndedCallbacks.forEach(callback => callback())
    }

    // 监听音频播放进度更新事件
    this.onTimeUpdateCallbacks.forEach(callback => callback())

    if (this.status.isBuffering !== status.isBuffering) {
      this.status.isBuffering = status.isBuffering
      if (status.isBuffering) {
        this.onWaitingCallbacks.forEach(callback => callback())
      }
    }

    if (this.status.isLoaded !== status.isLoaded) {
      this.status.isLoaded = status.isLoaded
      if (status.isLoaded) {
        this.onCanplayCallbacks.forEach(callback => callback())
      }
    }
  }

  set src(value) {
    this._src = value
    if (this._autoplay) {
      this._firstPlay()
    }
  }

  get src() {
    return this._src
  }

  set autoplay(value) {
    this._autoplay = value
    if (this._src && value) {
      this._firstPlay()
    }
  }

  get autoplay() {
    return this._autoplay
  }

  set startTime(value) {
    this._startTime = value
  }

  get startTime() {
    return this._startTime
  }

  set volume(value) {
    this.player.volume = value
  }

  get volume() {
    return this.player.volume
  }

  set loop(value: boolean) {
    this.player.loop = value
  }

  get loop() {
    return this.player.loop
  }

  set playbackRate(value: number) {
    this.player.setPlaybackRate(value)
  }

  get playbackRate() {
    return this.player.playbackRate
  }

  get duration() {
    return this.player.duration
  }

  get currentTime() {
    return this.player.currentTime
  }

  get paused() {
    return this.player.paused
  }

  /**
   * 不支持实现获取缓冲进度
   */
  get buffered() {
    return 0
  }

  private async _firstPlay() {
    if (!this._src) return { errMsg: 'src is undefined' }
    const source = isUrl(this._src) ? { uri: this._src } : this._src

    this.player.replace(source)

    await this.player.seekTo(this._startTime || 0)

    this.player.play()
    this.onPlayCallbacks.forEach(callback => callback())
  }

  /**
   *  播放
   */
  async play() {
    // if (!this.autoplay) {
    //   this._firstPlay()
    // } else {
    //   this.player.play()
    // }
    if (!this.autoplay && !this.status.isLoaded) {
      this._firstPlay()
      return
    }
    this.player.play()
  }

  /**
   *  暂停。暂停后的音频再播放会从暂停处开始播放
   */
  pause() {
    this.player.pause()
    this.onPauseCallbacks.forEach(callback => callback())
  }

  /**
   * 停止。停止后的音频再播放会从头开始播放
   */
  async stop() {
    try {
      this.player.pause()
      await this.player.seekTo(0)
      this.onStopCallbacks.forEach(callback => callback())
    } catch (error) {
      this.onErrorCallbacks.forEach(callback => callback(error))
    }
  }

  /**
   * 跳转到指定位置
   * @param position - 跳转的时间，单位 s。精确到小数点后 3 位，即支持 ms 级别精确度
   */
  async seek(position: number) {
    try {
      this.onSeekingCallbacks.forEach(callback => callback())
      await this.player.seekTo(position)
      this.onSeekedCallbacks.forEach(callback => callback())
    } catch (error) {
      this.onErrorCallbacks.forEach(callback => callback(error))
    }
  }

  /**
   * 销毁当前实例
   */
  destroy() {
    this.player.removeAllListeners('playbackStatusUpdate')
    this.player.pause()
    this.player.remove()
    this.player.release()
    this.player = null
  }

  /**
   * 监听音频进入可以播放状态的事件。但不保证后面可以流畅播放
   * @param callback
   */
  onCanplay(callback: () => void) {
    this.onCanplayCallbacks.push(callback)
  }

  /**
   * 取消监听音频进入可以播放状态的事件
   */
  offCanplay(callback?: () => void) {
    if (!callback) {
      this.onCanplayCallbacks = []
      return
    }
    this.onCanplayCallbacks = this.onCanplayCallbacks.filter(item => item !== callback)
  }

  /**
   * 监听音频播放事件
   * @param callback
   */
  onPlay(callback: () => void) {
    this.onPlayCallbacks.push(callback)
  }

  /**
   * 取消监听音频播放事件
   * @param callback
   */
  offPlay(callback?: () => void) {
    if (!callback) {
      this.onPlayCallbacks = []
      return
    }
    this.onPlayCallbacks = this.onPlayCallbacks.filter(item => item !== callback)
  }

  /**
   *  监听音频暂停事件
   * @param callback
   */
  onPause(callback: () => void) {
    this.onPauseCallbacks.push(callback)
  }

  /**
   * 取消监听音频暂停事件
   */
  offPause(callback?: () => void) {
    if (!callback) {
      this.onPauseCallbacks = []
      return
    }
    this.onPauseCallbacks = this.onPauseCallbacks.filter(item => item !== callback)
  }

  /**
   * 监听音频停止事件
   * @param callback
   */
  onStop(callback: () => void) {
    this.onStopCallbacks.push(callback)
  }

  /**
   *  取消监听音频停止事件
   */
  offStop(callback?: () => void) {
    if (!callback) {
      this.onStopCallbacks = []
      return
    }
    this.onStopCallbacks = this.onStopCallbacks.filter(item => item !== callback)
  }

  /**
   * 监听音频自然播放至结束的事件
   * @param callback
   */
  onEnded(callback: () => void) {
    this.onEndedCallbacks.push(callback)
  }

  /**
   * 取消监听音频自然播放至结束的事件
   */
  offEnded(callback?: () => void) {
    if (!callback) {
      this.onEndedCallbacks = []
      return
    }
    this.onEndedCallbacks = this.onEndedCallbacks.filter(item => item !== callback)
  }

  /**
   * 监听音频播放进度更新事件
   * @param callback
   */
  onTimeUpdate(callback: () => void) {
    this.onTimeUpdateCallbacks.push(callback)
  }

  /**
   * 取消监听音频播放进度更新事件
   */
  offTimeUpdate(callback?: () => void) {
    if (!callback) {
      this.onTimeUpdateCallbacks = []
      return
    }
    this.onTimeUpdateCallbacks = this.onTimeUpdateCallbacks.filter(item => item !== callback)
  }

  /**
   * 监听音频播放错误事件
   * @param callback
   */
  onError(callback: (error: any) => void) {
    this.onErrorCallbacks.push(callback)
  }

  /**
   * 取消监听音频播放错误事件
   */
  offError(callback?: (error: any) => void) {
    if (!callback) {
      this.onErrorCallbacks = []
      return
    }
    this.onErrorCallbacks = this.onErrorCallbacks.filter(item => item !== callback)
  }

  /**
   * 监听音频加载中事件。当音频因为数据不足，需要停下来加载时会触发
   * @param callback
   */
  onWaiting(callback: () => void) {
    this.onWaitingCallbacks.push(callback)
  }

  /**
   * 取消监听音频加载中事件
   */
  offWaiting(callback?: () => void) {
    if (!callback) {
      this.onWaitingCallbacks = []
      return
    }
    this.onWaitingCallbacks = this.onWaitingCallbacks.filter(item => item !== callback)
  }

  /**
   * 监听音频进行跳转操作的事件
   * @param callback
   */
  onSeeking(callback: () => void) {
    this.onSeekingCallbacks.push(callback)
  }

  /**
   * 取消监听音频进行跳转操作的事件
   */
  offSeeking(callback?: () => void) {
    if (!callback) {
      this.onSeekingCallbacks = []
      return
    }
    this.onSeekingCallbacks = this.onSeekingCallbacks.filter(item => item !== callback)
  }

  /**
   *  监听音频完成跳转操作的事件
   * @param callback
   */
  onSeeked(callback: () => void) {
    this.onSeekedCallbacks.push(callback)
  }

  /**
   * 取消监听音频完成跳转操作的事件
   */
  offSeeked(callback?: () => void) {
    if (!callback) {
      this.onSeekedCallbacks = []
      return
    }
    this.onSeekedCallbacks = this.onSeekedCallbacks.filter(item => item !== callback)
  }
}

/**
 * 创建 audio 上下文 AudioContext 对象。
 */
export function createInnerAudioContext(option: { useWebAudioImplement?: boolean } = {}): InnerAudioContext {
  return new InnerAudioContext(option)
}
