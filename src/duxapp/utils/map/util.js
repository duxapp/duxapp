import Taro from '@tarojs/taro'
import { userConfig } from '@/duxapp/config/userConfig'
import { asyncTimeOut } from '../util'
import { nav } from '../route'
import { mapApi } from './api'

let PermissionsAndroid, Platform, Geolocation

if (process.env.TARO_ENV === 'rn') {
  const RN = require('react-native')
  PermissionsAndroid = RN.PermissionsAndroid
  Platform = RN.Platform
  Geolocation = require('@react-native-community/geolocation').default
  Geolocation.setRNConfiguration({
    locationProvider: 'android'
  })
}

const PI = Math.PI
const x_pi = PI * 3000.0 / 180.0

const transformLat = (x, y) => {
  let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(y * PI) + 40.0 * Math.sin(y / 3.0 * PI)) * 2.0 / 3.0;
  ret += (160.0 * Math.sin(y / 12.0 * PI) + 320 * Math.sin(y * PI / 30.0)) * 2.0 / 3.0;
  return ret;
}
const transformLon = (x, y) => {
  let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(x * PI) + 40.0 * Math.sin(x / 3.0 * PI)) * 2.0 / 3.0;
  ret += (150.0 * Math.sin(x / 12.0 * PI) + 300.0 * Math.sin(x / 30.0 * PI)) * 2.0 / 3.0;
  return ret;
}

const delta = (lat, lon) => {
  let a = 6378245.0; //  a: 卫星椭球坐标投影到平面地图坐标系的投影因子。
  let ee = 0.00669342162296594323; //  ee: 椭球的偏心率。
  let dLat = transformLat(lon - 105.0, lat - 35.0);
  let dLon = transformLon(lon - 105.0, lat - 35.0);
  let radLat = lat / 180.0 * PI;
  let magic = Math.sin(radLat);
  magic = 1 - ee * magic * magic;
  let sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * PI);
  dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * PI);
  return { lat: dLat, lon: dLon };
}

const outOfChina = (lat, lon) => {
  if (lon < 72.004 || lon > 137.8347)
    return true;
  if (lat < 0.8293 || lat > 55.8271)
    return true;
  return false;
}

/**
  WGS-84 GPS坐标
  GCJ-02 火星坐标
  BD-09 百度坐标
**/

//WGS-84 to GCJ-02
export const gcjEncrypt = (wgsLat, wgsLon) => {
  if (outOfChina(wgsLat, wgsLon))
    return { lat: wgsLat, lon: wgsLon };

  let d = delta(wgsLat, wgsLon);
  return { lat: wgsLat + d.lat, lon: wgsLon + d.lon };
}

//GCJ-02 to WGS-84
export const gcjDecrypt = (gcjLat, gcjLon) => {
  if (outOfChina(gcjLat, gcjLon))
    return { lat: gcjLat, lon: gcjLon };

  let d = delta(gcjLat, gcjLon);
  return { lat: gcjLat - d.lat, lon: gcjLon - d.lon };
}

//GCJ-02 to WGS-84 exactly
export const gcjDecryptExact = (gcjLat, gcjLon) => {
  let initDelta = 0.01;
  let threshold = 0.000000001;
  let dLat = initDelta, dLon = initDelta;
  let mLat = gcjLat - dLat, mLon = gcjLon - dLon;
  let pLat = gcjLat + dLat, pLon = gcjLon + dLon;
  let wgsLat, wgsLon, i = 0;
  while (1) {
    wgsLat = (mLat + pLat) / 2;
    wgsLon = (mLon + pLon) / 2;
    let tmp = gcjEncrypt(wgsLat, wgsLon)
    dLat = tmp.lat - gcjLat;
    dLon = tmp.lon - gcjLon;
    if ((Math.abs(dLat) < threshold) && (Math.abs(dLon) < threshold))
      break;

    if (dLat > 0) pLat = wgsLat; else mLat = wgsLat;
    if (dLon > 0) pLon = wgsLon; else mLon = wgsLon;

    if (++i > 10000) break;
  }
  return { lat: wgsLat, lon: wgsLon };
}

//GCJ-02 to BD-09
export const bdEncrypt = (gcjLat, gcjLon) => {
  let x = gcjLon, y = gcjLat;
  let z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
  let theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
  let bdLon = z * Math.cos(theta) + 0.0065;
  let bdLat = z * Math.sin(theta) + 0.006;
  return { lat: bdLat, lon: bdLon };
}

//BD-09 to GCJ-02
export const bdDecrypt = (bdLat, bdLon) => {
  let x = bdLon - 0.0065, y = bdLat - 0.006;
  let z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
  let theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
  let gcjLon = z * Math.cos(theta);
  let gcjLat = z * Math.sin(theta);
  return { lat: gcjLat, lon: gcjLon };
}

// 计算两点之间的距离 单位m
export const distance = (latA, lonA, latB, lonB) => {
  let earthR = 6371000.;
  let x = Math.cos(latA * PI / 180.) * Math.cos(latB * PI / 180.) * Math.cos((lonA - lonB) * PI / 180);
  let y = Math.sin(latA * PI / 180.) * Math.sin(latB * PI / 180.);
  let s = x + y;
  if (s > 1) s = 1;
  if (s < -1) s = -1;
  let alpha = Math.acos(s);
  return alpha * earthR;
}

/**
 * 检查是否获得定位权限 主要用户判断安卓用户审核问题
 * @returns
 */
export const checkLocationPermission = async () => {
  if (process.env.TARO_ENV === 'rn') {
    if (Platform.OS === 'android') {
      return await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
    } else {
      return true
    }
  } else {
    return true
  }
}

/**
 * 获取用户当前经纬度 返回火星坐标
 * 如果定位失败会返回错误
 */
export const getLocationBase = (enableHighAccuracy = false) => {
  const pormise = new Promise(async (resolve, reject) => {
    if (process.env.TARO_ENV === 'rn') {
      const errKey = 'get-location-duxapp-error'
      try {
        const { data } = await Taro.getStorage({
          key: errKey
        })
        const errDate = JSON.parse(data).errDate
        if (new Date().getTime() - errDate < 2 * 24 * 60 * 60 * 1000) {
          const msg = '距离上次用户拒绝授权位置信息不足24小时，不再次授权信息'
          console.log(msg)
          reject({ message: msg })
          return
        }
      } catch (error) {

      }
      if (Platform.OS === 'android') {
        /**
         * fix: 安卓机上奇怪的bug，不在获取权限之前加个定时器的话，定位成功回调不触发
         */
        await asyncTimeOut(20)
        const status = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
        if (!status) {
          const config = userConfig.option.duxapp.app?.permissions?.location
          if (config) {
            const { confirm } = await Taro.showModal({
              title: config.title,
              content: config.content,
              confirmText: '快速开启定位',
              cancelText: '暂不开启'
            })
            if (!confirm) {
              reject({ message: '用户拒绝位置授权' })
              return
            }
          }
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              // 第一次请求【拒绝】后提示用户你为什么要这个权限
              title: config?.title || '需要访问您的位置信息',
              message: config?.title || 'APP将访问您的位置信息，以获取完整服务'
            }
          )
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            // 记录获取失败的时间 等待 48小时之后再次获取时间 某些安卓平台 拒绝之后短时间内再次弹出会不让通过
            await Taro.setStorage({
              key: errKey,
              data: JSON.stringify({
                errDate: new Date().getTime()
              })
            })
            reject({ message: '权限获取失败' })
            return
          }
        }

      }
      Geolocation.getCurrentPosition(info => {
        // 通过高精度模式再获取一次定位通过onChange函数回调
        // !enableHighAccuracy && getLocationBase(true).then(changeFunc)
        console.log('定位成功', enableHighAccuracy)
        const { latitude, longitude } = info.coords
        const { lat, lon } = gcjEncrypt(latitude, longitude)
        resolve({
          latitude: lat,
          longitude: lon
        })
      }, err => {
        console.log('定位失败', enableHighAccuracy)
        if (!enableHighAccuracy) {
          // 使用高精度重试获取定位
          // getLocationBase(true).then(resolve).catch(reject)
          reject(err)
        } else {
          reject(err)
        }
      }, {
        timeout: 15000,
        ...(enableHighAccuracy ? { maximumAge: 5000 } : {}),
        enableHighAccuracy
      })
    } else {
      Taro.getLocation({
        type: 'gcj02'
      }).then(res => {
        resolve(res)
      }).catch(() => {
        reject({ message: '获取定位失败' })
      })
      !enableHighAccuracy && Taro.getLocation({
        type: 'gcj02',
        isHighAccuracy: true
      }).then(changeFunc)
    }

  })
  let changeFunc
  pormise.onChange = func => {
    changeFunc = func
    return pormise
  }
  return pormise
}

/**
 * 获取位置信息包含省市区信息
 * @returns
 */
export const getLocation = async () => {
  const { latitude, longitude } = await getLocationBase()
  return await mapApi.getRegeo(longitude, latitude)
}

/**
 * 选择位置
 * @param {number} lng 当先的精度
 * @param {number} lat 当前的纬度
 */
export const chooseLocation = async (lng = '', lat = '') => {
  const { backData } = await nav('duxapp/location/index', { lng, lat })
  const info = await backData()
  if (info) {
    return info
  }
  throw '取消选择'
}
