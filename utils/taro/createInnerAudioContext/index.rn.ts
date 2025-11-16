import { AudioPlayer, createAudioPlayer, AudioStatus } from 'expo-audio'

import { isUrl } from '@tarojs/taro-rn/src/utils'

/**
 * InnerAudioContext 实例，可通过 wx.createInnerAudioContext 接口获取实例。
 */
class InnerAudioContext {
  private _src: string
  private _startTime: number
  private _autoplay = false
  // private
  private player: AudioPlayer
  private onCanplayCallback: () => void
  private onEndedCallback: () => void
  private onErrorCallback: (error: any) => void
  private onPauseCallback: () => void
  private onPlayCallback: () => void
  private onSeekedCallback: () => void
  private onSeekingCallback: () => void
  private onStopCallback: () => void
  private onTimeUpdateCallback: () => void
  private onWaitingCallback: () => void

  // 标记状态，用于事件回调
  private status = {
    endTime: 0,
    isBuffering: false,
    isLoaded: false
  }

  constructor() {
    this.player = createAudioPlayer()
    this.player.addListener('playbackStatusUpdate', this._onPlaybackStatusUpdate)
  }

  _onPlaybackStatusUpdate = (status: AudioStatus) => {
    if (!this.player.loop && status.didJustFinish && Date.now() - this.status.endTime > 10) {
      this.status.endTime = Date.now()
      this.onEndedCallback && this.onEndedCallback()
    }

    // 监听音频播放进度更新事件
    this.onTimeUpdateCallback && this.onTimeUpdateCallback()

    if (this.status.isBuffering !== status.isBuffering) {
      this.status.isBuffering = status.isBuffering
      if (this.onWaitingCallback && status.isBuffering) {
        this.onWaitingCallback()
      }
    }

    if (this.status.isLoaded !== status.isLoaded) {
      this.status.isLoaded = status.isLoaded
      if (this.onCanplayCallback && status.isLoaded) {
        this.onCanplayCallback()
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
    this.onPlayCallback && this.onPlayCallback()
  }

  /**
   *  播放
   */
  async play() {
    if (!this.autoplay) {
      this._firstPlay()
    } else {
      this.player.play()
    }
  }

  /**
   *  暂停。暂停后的音频再播放会从暂停处开始播放
   */
  pause() {
    this.player.pause()
    this.onPauseCallback && this.onPauseCallback()
  }

  /**
   * 停止。停止后的音频再播放会从头开始播放
   */
  async stop() {
    try {
      this.player.pause()
      await this.player.seekTo(0)
      this.onStopCallback && this.onStopCallback()
    } catch (error) {
      this.onErrorCallback && this.onErrorCallback(error)
    }
  }

  /**
   * 跳转到指定位置
   * @param position - 跳转的时间，单位 s。精确到小数点后 3 位，即支持 ms 级别精确度
   */
  async seek(position: number) {
    try {
      this.onSeekingCallback && this.onSeekingCallback()
      await this.player.seekTo(position)
      this.onSeekedCallback && this.onSeekedCallback()
    } catch (error) {
      this.onErrorCallback && this.onErrorCallback(error)
    }
  }

  /**
   * 销毁当前实例
   */
  destroy() {
    this.player.pause()
    this.player.remove()
  }

  /**
   * 监听音频进入可以播放状态的事件。但不保证后面可以流畅播放
   * @param callback
   */
  onCanplay(callback: () => void) {
    this.onCanplayCallback = callback
  }

  /**
   * 取消监听音频进入可以播放状态的事件
   */
  offCanplay() {
    this.onCanplayCallback = undefined
  }

  /**
   * 监听音频播放事件
   * @param callback
   */
  onPlay(callback: () => void) {
    this.onPlayCallback = callback
  }

  /**
   * 取消监听音频播放事件
   * @param callback
   */
  offPlay() {
    this.onPlayCallback = undefined
  }

  /**
   *  监听音频暂停事件
   * @param callback
   */
  onPause(callback: () => void) {
    this.onPauseCallback = callback
  }

  /**
   * 取消监听音频暂停事件
   */
  offPause() {
    this.onPauseCallback = undefined
  }

  /**
   * 监听音频停止事件
   * @param callback
   */
  onStop(callback: () => void) {
    this.onStopCallback = callback
  }

  /**
   *  取消监听音频停止事件
   */
  offStop() {
    this.onStopCallback = undefined
  }

  /**
   * 监听音频自然播放至结束的事件
   * @param callback
   */
  onEnded(callback: () => void) {
    this.onEndedCallback = callback
  }

  /**
   * 取消监听音频自然播放至结束的事件
   */
  offEnded() {
    this.onEndedCallback = undefined
  }

  /**
   * 监听音频播放进度更新事件
   * @param callback
   */
  onTimeUpdate(callback: () => void) {
    this.onTimeUpdateCallback = callback
  }

  /**
   * 取消监听音频播放进度更新事件
   */
  offTimeUpdate() {
    this.onTimeUpdateCallback = undefined
  }

  /**
   * 监听音频播放错误事件
   * @param callback
   */
  onError(callback: (error: any) => void) {
    this.onErrorCallback = callback
  }

  /**
   * 取消监听音频播放错误事件
   */
  offError() {
    this.onErrorCallback = undefined
  }

  /**
   * 监听音频加载中事件。当音频因为数据不足，需要停下来加载时会触发
   * @param callback
   */
  onWaiting(callback: () => void) {
    this.onWaitingCallback = callback
  }

  /**
   * 取消监听音频加载中事件
   */
  offWaiting() {
    this.onWaitingCallback = undefined
  }

  /**
   * 监听音频进行跳转操作的事件
   * @param callback
   */
  onSeeking(callback: () => void) {
    this.onSeekingCallback = callback
  }

  /**
   * 取消监听音频进行跳转操作的事件
   */
  offSeeking() {
    this.onSeekingCallback = undefined
  }

  /**
   *  监听音频完成跳转操作的事件
   * @param callback
   */
  onSeeked(callback: () => void) {
    this.onSeekedCallback = callback
  }

  /**
   * 取消监听音频完成跳转操作的事件
   */
  offSeeked() {
    this.onSeekedCallback = undefined
  }
}

/**
 * 创建 audio 上下文 AudioContext 对象。
 */
export function createInnerAudioContext(): InnerAudioContext {
  return new InnerAudioContext()
}
