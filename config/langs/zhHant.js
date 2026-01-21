export default {
  common: {
    loading: '請稍後',
    cancel: '取消',
    cancelSelect: '取消選擇'
  },
  request: {
    notInit: '資料未初始化',
    loadEnd: '資料已經載入完成',
    loading: '請稍後，正在載入中'
  },
  media: {
    source: {
      album: '相簿',
      camera: '相機',
      photo: '拍照',
      video: '錄影'
    },
    perm: {
      albumDenied: '申請相簿權限被拒絕',
      cameraDenied: '申請相機權限被拒絕'
    },
    error: {
      invalidData: '錯誤資料：{{data}}'
    }
  },
  permission: {
    tipTitle: '{{name}} 權限使用說明',
    camera: {
      name: '相機',
      message: '用於更換頭像、回饋問題拍照等用途'
    },
    audio: {
      name: '麥克風',
      message: '使用者錄製音訊內容供系統使用'
    },
    image: {
      name: '相機或相簿',
      message: '用於更換頭像、回饋問題拍照等用途'
    },
    video: {
      name: '相機或相簿',
      message: '用於更換頭像、回饋問題錄製等用途'
    },
    location: {
      name: '位置資訊',
      message: '用於定位您的位置，展示附近推薦'
    },
    saveMedia: {
      name: '相簿寫入',
      message: '用於儲存使用者頭像、推廣海報等用途'
    }
  },
  font: {
    loadFail: '{{name}} 字體載入失敗，請確認網路環境，重啟後重試'
  },
  map: {
    provider: {
      amap: '高德地圖',
      baidu: '百度地圖'
    },
    toast: {
      noApp: '沒有合適的地圖 APP'
    },
    nav: {
      needDestination: '需要終點經緯度',
      needDestinationName: '需要傳終點名稱或者經緯度',
      openSuccess: '打開成功',
      noAmap: '尚未安裝高德地圖',
      noBaidu: '尚未安裝百度地圖'
    },
    location: {
      rnNotSupported: 'RN 端不支援取得定位',
      failed: '取得定位失敗'
    }
  }
}
