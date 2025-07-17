import { KeyboardAvoidingView, Platform } from 'react-native'
import './index.scss'

export const KeyboardAvoiding = ({ children, isForm, enabled = isForm ?? true }) => {
  return enabled ?
    <KeyboardAvoidingView
      className='keyboard-avoiding'
      behavior={Platform.OS !== 'android' ? 'padding' : 'height'}
      enabled
    >
      {children}
    </KeyboardAvoidingView>
    : <>{children}</>
}
