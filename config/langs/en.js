export default {
  common: {
    loading: 'Please wait',
    cancel: 'Cancel',
    cancelSelect: 'Selection cancelled'
  },
  request: {
    notInit: 'Data not initialized',
    loadEnd: 'All data loaded',
    loading: 'Please wait, loading...'
  },
  media: {
    source: {
      album: 'Album',
      camera: 'Camera',
      photo: 'Photo',
      video: 'Video'
    },
    perm: {
      albumDenied: 'Album permission denied',
      cameraDenied: 'Camera permission denied'
    },
    error: {
      invalidData: 'Invalid data: {{data}}'
    }
  },
  permission: {
    tipTitle: '{{name}} permission usage',
    camera: {
      name: 'Camera',
      message: 'Used for changing avatars and taking photos for feedback.'
    },
    audio: {
      name: 'Microphone',
      message: 'Used for recording audio content.'
    },
    image: {
      name: 'Camera or Album',
      message: 'Used for changing avatars and taking photos for feedback.'
    },
    video: {
      name: 'Camera or Album',
      message: 'Used for changing avatars and recording videos for feedback.'
    },
    location: {
      name: 'Location',
      message: 'Used to locate your position and show nearby recommendations.'
    },
    saveMedia: {
      name: 'Save to Album',
      message: 'Used to save avatars, promotional posters, etc.'
    }
  },
  font: {
    loadFail: '{{name}} font failed to load. Please check your network and restart to try again.'
  },
  map: {
    provider: {
      amap: 'Amap',
      baidu: 'Baidu Map'
    },
    toast: {
      noApp: 'No supported map app found'
    },
    nav: {
      needDestination: 'Destination coordinates are required',
      needDestinationName: 'Destination name or coordinates are required',
      openSuccess: 'Opened successfully',
      noAmap: 'Amap is not installed',
      noBaidu: 'Baidu Map is not installed'
    },
    location: {
      rnNotSupported: 'Location is not supported on RN',
      failed: 'Failed to get location'
    }
  }
}
