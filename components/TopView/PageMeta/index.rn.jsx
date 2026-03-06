import { useEffect } from 'react'
import { StatusBar } from 'react-native'
import * as ScreenOrientation from 'expo-screen-orientation'

export const PageMeta = ({ pageOrientation = 'portrait' }) => {
  useEffect(() => {
    let isActive = true
    let previousLock = null
    let statusBarEntry = null

    const applyOrientation = async () => {
      if (!isActive) return
      try {
        previousLock = await ScreenOrientation.getOrientationLockAsync()
      } catch (error) {
        // Ignore failures; we'll fall back to unlock on cleanup.
        previousLock = null
      }
      if (pageOrientation === 'landscape') {
        statusBarEntry = StatusBar.pushStackEntry({ hidden: true, animated: true })
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE)
        return
      }
      if (pageOrientation === 'portrait') {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
        return
      }

      await ScreenOrientation.unlockAsync()
    }

    applyOrientation()

    return () => {
      isActive = false
      if (statusBarEntry) {
        StatusBar.popStackEntry(statusBarEntry)
        statusBarEntry = null
      }
      if (previousLock) {
        ScreenOrientation.lockAsync(previousLock).catch(() => {})
      } else {
        ScreenOrientation.unlockAsync().catch(() => {})
      }
    }
  }, [pageOrientation])

  return null
}
