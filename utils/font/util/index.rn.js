import { loadAsync } from 'expo-font'

export const loadFont = async (name, url) => {
  return await loadAsync(name, url)
}

export const loadLocalFont = loadFont
