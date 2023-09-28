import codePush from 'react-native-code-push'
import Taro from '@tarojs/taro'
import { Image, Text, View } from '@tarojs/components'
// react-native-wechat-lib start
import { registerApp, isWXAppInstalled, sendAuthRequest } from 'react-native-wechat-lib'
// react-native-wechat-lib end
import { Platform, LogBox, Linking, Alert, PermissionsAndroid, NativeModules, StatusBar } from 'react-native'
import { getVersion } from 'react-native-device-info'
import { hide } from 'react-native-bootsplash'
import { TopView } from '@/duxapp/components/Overlay/TopView'
import { Button } from '@/duxapp/components/Button'
import { useEffect, useMemo, useRef, useState } from 'react'
import RNFetchBlob from 'rn-fetch-blob'
import DuxPush from 'react-native-dux-push'
import RNShare from 'react-native-share'
import RNFS from 'react-native-fs'
import config from '@/duxapp/config/app'
import duxappTheme from '@/duxapp/config/theme'
import { Agreement } from '@/duxapp/components/Agreement/index.rn'
import { asyncTimeOut, toast } from '../util'
import { ObjectManage } from '../data'
import closeIcon from './images/close.png'
import './index.scss'


let statusBarHeight = 0

if (Platform.OS === 'ios') {
  NativeModules.StatusBarManager.getHeight(val => statusBarHeight = val.height)
}

export const getStatusBarHeight = () => {
  return Platform.OS === 'android' ? StatusBar.currentHeight : statusBarHeight
}


// react-native-wechat-lib start
export const wechatInit = async () => {
  await Agreement.isComplete()
  registerApp(config.wxAppid, config.wxUniversalLink)
}
// react-native-wechat-lib end

// 屏蔽黄屏警告
LogBox.ignoreLogs(['Require cycle', 'Constants', 'nativeEvent'])

/**
 * 版本号比较
 * @param {*} curV 当前版本
 * @param {*} reqV 请求的版本
 * @returns
 */
export const compare = (curV, reqV) => {
  if (curV && reqV) {
    //将两个版本号拆成数字
    const arr1 = curV.split('.'),
      arr2 = reqV.split('.')
    let minLength = Math.min(arr1.length, arr2.length),
      position = 0,
      diff = 0
    //依次比较版本号每一位大小，当对比得出结果后跳出循环（后文有简单介绍）
    while (position < minLength && ((diff = parseInt(arr1[position]) - parseInt(arr2[position])) == 0)) {
      position++
    }
    diff = (diff != 0) ? diff : (arr1.length - arr2.length);
    //若curV大于reqV，则返回true
    return diff > 0
  } else {
    //输入为空
    return false
  }
}



class AppUpgrade extends ObjectManage {
  constructor() {
    super({})
  }
  data = {
    received: 0,
    total: 0,
    progress: 0
  }

  setProgress = (received, total) => {
    const kb = [received / 1024, total / 1024]
    this.set({
      received: kb[0],
      total: kb[1],
      progress: kb[0] / kb[1]
    })
  }

  useProgress = () => {
    const [progress, setProgress] = useState(this.data)

    const { remove } = useMemo(() => {
      return this.onSet(data => {
        setProgress(data)
      })
    }, [])

    useEffect(() => {
      return () => remove()
    }, [remove])

    return progress
  }
}

const appUpgrade = new AppUpgrade()

const AppUpgradeConfirm = ({
  onClose,
  onSubmit,
  content
}) => {
  useEffect(() => {
    return () => onClose()
  }, [onClose])

  return (
    <View className='AppUC absolute inset-0 items-center justify-center'>
      <View className='AppUC__main'>
        <Text className='AppUC__title'>更新提示</Text>
        {content && <View className='AppUC__content'>{content}</View>}
        <View className='AppUC__submit' row>
          <Button
            text='立即更新'
            color={duxappTheme.primaryColor}
            onClick={onSubmit}
            size='xl'
          />
        </View>
        <View onClick={onClose} className='AppUC__close'>
          <Image className='AppUC__close__icon' src={closeIcon} />
        </View>
      </View>
    </View>
  )
}

AppUpgradeConfirm.show = (content) => {
  return new Promise((resolve, reject) => {
    const { remove } = TopView.add([AppUpgradeConfirm, {
      content,
      onClose: () => {
        reject()
        remove()
      },
      onSubmit: () => {
        resolve()
        remove()
      }
    }])
  })
}

const AppUpgradeProgress = () => {

  const { received, total, progress } = appUpgrade.useProgress()

  return (
    <View className='AppUC absolute inset-0 items-center justify-center'>
      <View className='AppUC__main'>
        <Text className='AppUC__title'>下载中</Text>
        <View className='AppUP__progress'>
          <View className='AppUP__progress__child' style={{ width: progress * 100 + '%' }} />
          <View className='AppUP__progress__text'>{(received / 1024).toFixed(2) + 'MB/' + (total / 1024).toFixed(2) + 'MB'}</View>
        </View>
      </View>
    </View>
  )
}

AppUpgradeProgress.show = () => {
  return TopView.add([AppUpgradeProgress, {}])
}

export const systemUploadApp = (() => {
  let info = null
  return async _config => {
    if (_config) {
      info = _config
    }
    if (!info) {
      return false
    }
    if (Platform.OS === 'android') {
      if (compare(info.androidVersion, getVersion()) && (info.androidUrl || info.androidDowloadUrl)) {
        let progressView
        try {
          await AppUpgradeConfirm.show(info.androidUpdateInfo)
          if (info.androidDowloadUrl) {
            const task = Taro.downloadFile({
              url: info.androidDowloadUrl
            })
            progressView = AppUpgradeProgress.show()
            task.onProgressUpdate(res => {
              appUpgrade.setProgress(res.totalBytesWritten, res.totalBytesExpectedToWrite)
            })
            const { tempFilePath } = await task
            progressView.remove()
            await asyncTimeOut(200)
            RNFetchBlob.android.actionViewIntent(
              tempFilePath.replace('file://', ''),
              'application/vnd.android.package-archive'
            )
          } else {
            // 打开浏览器
            Linking.openURL(info.androidUrl)
          }
        } catch (error) {
          if (progressView) {
            progressView.remove()
          }
        }

        return true
      }
    } else {
      if (compare(info.iosVersion, getVersion()) && info.iosUrl) {
        Alert.alert(
          '有新版本',
          info.iosUpdateInfo,
          [
            { text: '取消', onPress: () => { }, style: 'cancel' },
            { text: '立即更新', onPress: () => Linking.openURL(info.iosUrl) }
          ]
        )
        return true
      }
    }
  }
})();

export const updateApp = async (appInfo) => {
  // eslint-disable-next-line no-undef
  if (__DEV__) {
    console.log('updateApp:调试模式不可用')
    return
  }
  // 有二进制文件更新则不执行codepush更新
  if (await systemUploadApp(appInfo)) {
    return
  }
  const update = await codePush.getUpdateMetadata(codePush.UpdateState.PENDING)
  if (update) {
    Taro.showModal({
      title: '提示',
      content: '是否立即重启更新到最新版本'
    }).then(({ confirm }) => {
      confirm && update.install(codePush.InstallMode.IMMEDIATE)
    })
  } else {
    codePush.sync({
      deploymentKey: Platform.OS === 'android' ? config.codePushAndroidKey : config.codePushIosKey,
      updateDialog: {
        appendReleaseDescription: true,
        descriptionPrefix: '',
        mandatoryContinueButtonLabel: '更新',
        mandatoryUpdateMessage: '必须安装的更新',
        optionalIgnoreButtonLabel: '稍后',
        optionalInstallButtonLabel: '安装',
        optionalUpdateMessage: '有可用更新,你要安装它吗?',
        title: '有新版本'
      },
      installMode: codePush.InstallMode.IMMEDIATE,
      mandatoryInstallMode: codePush.InstallMode.IMMEDIATE,
      rollbackRetryOptions: {
        delayInHours: 0,
        maxRetryAttempts: 5
      }
    }, status => {
      switch (status) {
        case codePush.SyncStatus.CHECKING_FOR_UPDATE:
          toast('正在检查')
          break
        case codePush.SyncStatus.DOWNLOADING_PACKAGE:
          // toast('下载中')
          break
        case codePush.SyncStatus.INSTALLING_UPDATE:
          toast('正在安装')
          break
        case codePush.SyncStatus.UP_TO_DATE:
          toast('已经最新版')
          break
        case codePush.SyncStatus.UPDATE_INSTALLED:
          Taro.showModal({
            title: '提示',
            content: '是否立即重启更新到最新版本'
          }).then(({ confirm }) => {
            confirm && codePush.restartApp()
          })
          break
        case codePush.SyncStatus.SYNC_IN_PROGRESS:
          toast('处理中')
          break
        case codePush.SyncStatus.UPDATE_IGNORED:
          // toast('已经忽略当前版本')
          break
        case codePush.SyncStatus.UNKNOWN_ERROR:
          toast('更新遇到未知错误')
          break
        default:
          toast('错误:' + status)
          break
      }
    }, progress => {
      if (!updateApp.progressView) {
        updateApp.progressView = AppUpgradeProgress.show()
      }
      appUpgrade.setProgress(progress.receivedBytes, progress.totalBytes)
    }).catch(err => {
      toast(err.message)
    })
  }
}

// eslint-disable-next-line no-undef
export const codePushHigh = app => __DEV__ ? app : codePush({
  deploymentKey: Platform.OS === 'android' ? config.codePushAndroidKey : config.codePushIosKey,
  rollbackRetryOptions: {
    delayInHours: 0,
    maxRetryAttempts: 5
  }
})(app)

/**
 * 隐藏启动图
 * @returns
 */
export const startHide = () => hide({ fade: true })

/**
 * 申请安卓文件读取权限
 * @returns
 */
export const crequestMultiplePermission = async () => {
  const granteds = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  ])
  if (granteds['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted') {
    return true
  } else {
    throw '获取权限失败'
  }
}

export const duxPushInit = ({ onClick, onNotifyClick }) => {
  DuxPush.init(config.duxPushID, '', {
    umeng: config.umAppKey
  })
  const callback = status => {
    if (status) {
      setTimeout(() => {
        // 检测是否开通通知权限，未开通提示开通
        DuxPush.notificationsEnabled?.()?.then(res => {
          if (!res) {
            Alert.alert(
              '通知权限',
              '您当前未开启通知权限，您将无法收到消息推送，是否立即前往设置开启通知权限？',
              [
                { text: '取消', onPress: () => { }, style: 'cancel' },
                {
                  text: '立即前往', onPress: () => DuxPush.goPushSetting()
                }
              ]
            )
          }
        })
      }, 3000)
      DuxPush.addEventListener('duxpush_click', onClick)
      DuxPush.addEventListener('duxpush_notify', onNotifyClick)
    } else {
      DuxPush.unsetAlias('')
    }
  }
  return {
    callback,
    DuxPush,
    remove: () => {
      DuxPush.removeEventListener('duxpush_click')
      DuxPush.removeEventListener('duxpush_notify')
    }
  }
}

export const useLaunch = callback => {

  const data = useRef(callback)

  useEffect(() => {
    data.current?.()
  }, [])
}

const createAsyncNoRepeat = () => {
  const callbacks = []
  return {
    run: calback => {
      if (!callbacks.length) {
        calback().then(() => {
          callbacks.forEach(v => v[0]())
          callbacks.splice(0)
        }).catch(err => {
          callbacks.forEach(v => v[1](err))
          callbacks.splice(0)
        })
      }
      return new Promise((resolve, reject) => {
        callbacks.push([resolve, reject])
      })
    }
  }
}

/**
 * 验证ios端是否获得了网络请求权限
 * 因为ios app首次在手机上安装刚启动时请求会失败，需要做个验证，等待有网络之后再发起请求
 */
export const networkVerify = (() => {
  let status = false
  const noRepeat = createAsyncNoRepeat()
  return async params => {
    if (Platform.OS === 'ios') {
      if (status) {
        return params
      }
      await noRepeat.run(async () => {
        try {
          const res = await Taro.getStorage({ key: 'ios-request-verify' })
          if (res?.data) {
            status = true
            return params
          }
          throw '未获取本地信息'
        } catch (error) {
          // 去 递归验证
          const verify = async (level = 0) => {
            if (level > 120) {
              throw { message: '等待时间过长(超过30s) 请求失败' }
            }
            try {
              const baidu = await Taro.request({
                url: 'https://www.baidu.com'
              })
              if (baidu.statusCode !== 200) {
                throw '请求未成功'
              }
            } catch (error1) {
              if (error1?.statusCode !== 200) {
                await asyncTimeOut(200)
                await verify(level + 1)
              }
            }
          }
          await verify()
          await Taro.setStorage({ key: 'ios-request-verify', data: '1' })
        }
      })
      status = true
      return params
    } else {
      return params
    }
  }
})()

export {
  isWXAppInstalled,
  sendAuthRequest,
  Platform,
  RNShare,
  RNFS
}
