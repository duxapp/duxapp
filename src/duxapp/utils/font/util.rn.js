import { loadAsync } from 'expo-font'

export const loadFont = (name, url) => {
  return loadAsync({
    [name]: url
  })
}
