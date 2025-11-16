import { KeyboardAvoidingView, Platform } from 'react-native'
import './index.scss'

export const KeyboardAvoiding = ({ children, isForm, enabled = isForm ?? true }) => {
  return enabled ?
    <KeyboardAvoidingView
      className='KeyboardAvoiding'
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      enabled
    >
      {children}
    </KeyboardAvoidingView>
    : <>{children}</>
}
