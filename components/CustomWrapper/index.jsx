import { createContext, useContext } from 'react'

const context = createContext({ id: null })

export const CustomWrapper = ({ children }) => {
  return children
}

CustomWrapper.useContext = () => useContext(context)
