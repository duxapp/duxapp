import { useEffect, useRef } from 'react'
import { TopView } from '../TopView'

export const Absolute = ({ group, children }) => {
  const action = useRef(null)

  useEffect(() => {
    if (!action.current) {
      action.current = TopView.add(children, { group })
    } else {
      action.current.update(children)
    }
  }, [children, group])

  useEffect(() => {
    return () => action.current?.remove()
  }, [])

  return null
}
