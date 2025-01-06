import { getLocation } from '@tarojs/taro'
import { Platform, PermissionsAndroid } from '../rn/util'

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
    return { lat: wgsLat, lon: wgsLon, lng: wgsLon };

  let d = delta(wgsLat, wgsLon);
  return { lat: wgsLat + d.lat, lon: wgsLon + d.lon, lng: wgsLon + d.lon };
}

//GCJ-02 to WGS-84
export const gcjDecrypt = (gcjLat, gcjLon) => {
  if (outOfChina(gcjLat, gcjLon))
    return { lat: gcjLat, lon: gcjLon, lng: gcjLon };

  let d = delta(gcjLat, gcjLon);
  return { lat: gcjLat - d.lat, lon: gcjLon - d.lon, lng: gcjLon - d.lon };
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
  return { lat: wgsLat, lon: wgsLon, lng: wgsLon };
}

//GCJ-02 to BD-09
export const bdEncrypt = (gcjLat, gcjLon) => {
  let x = gcjLon, y = gcjLat;
  let z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
  let theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
  let bdLon = z * Math.cos(theta) + 0.0065;
  let bdLat = z * Math.sin(theta) + 0.006;
  return { lat: bdLat, lon: bdLon, lng: bdLon };
}

//BD-09 to GCJ-02
export const bdDecrypt = (bdLat, bdLon) => {
  let x = bdLon - 0.0065, y = bdLat - 0.006;
  let z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
  let theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
  let gcjLon = z * Math.cos(theta);
  let gcjLat = z * Math.sin(theta);
  return { lat: gcjLat, lon: gcjLon, lng: gcjLon };
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
 * 获取用户当前经纬度 返回火星坐标
 * 如果定位失败会返回错误
 */
export const getLocationBase = (enableHighAccuracy = false) => {
  const pormise = new Promise(async (resolve, reject) => {
    if (process.env.TARO_ENV === 'rn') {
      if (!getLocationBase.rn) {
        return reject({ message: 'RN端不支持获取定位' })
      }
      getLocationBase.rn(enableHighAccuracy).then(resolve).catch(reject)
    } else {
      const type = process.env.TARO_ENV === 'h5' ? 'wgs84' : 'gcj02'
      const getRes = res => {
        if (type === 'wgs84') {
          const { lat, lon } = gcjEncrypt(res.latitude, res.longitude)
          return {
            ...res,
            latitude: lat,
            longitude: lon
          }
        } else {
          return res
        }
      }
      getLocation({
        type,
        isHighAccuracy: enableHighAccuracy
      }).then(res => {
        resolve(getRes(res))
      }).catch(error => {
        console.log('定位失败', error)
        reject({ message: '获取定位失败', error })
      })
      // enableHighAccuracy && getLocation({
      //   type,
      //   isHighAccuracy: true
      // }).then(res => changeFunc?.(getRes(res)))
    }

  })
  let changeFunc
  pormise.onChange = func => {
    changeFunc = func
    return pormise
  }
  return pormise
}
