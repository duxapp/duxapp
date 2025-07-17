import { useEffect, useState } from 'react'
import { Keyboard, View, Pressable } from 'react-native'
import { GestureDetector, Gesture } from 'react-native-gesture-handler'

export const KeyboardDismiss = ({ children, buddle = true, style }) => {

  if (buddle) {
    return <Buddle style={style}>{children}</Buddle>
  }

  return <Pressable style={style} onPress={() => Keyboard.dismiss()}>
    {children}
  </Pressable>
}

const Buddle = ({ style, children }) => {
  const [show, setShow] = useState(() => Keyboard.isVisible())

  useEffect(() => {
    const didShow = Keyboard.addListener('keyboardDidShow', () => {
      setShow(true)
    })
    const didHide = Keyboard.addListener('keyboardDidHide', () => {
      setShow(false)
    })
    return () => {
      didShow.remove()
      didHide.remove()
    }
  }, [])

  const tap = Gesture.Tap()
    .enabled(show)
    .runOnJS(true)
    .onEnd(() => {
      Keyboard.dismiss()
    })

  return <GestureDetector gesture={tap}>
    <View style={style}>{children}</View>
  </GestureDetector>
}
