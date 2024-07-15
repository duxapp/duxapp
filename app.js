import {
  app,
  route
} from './utils'
import './utils/init'

app.register('duxapp')

export default {
  show: (...arg) => {
    route.showInit(...arg)
  }
}
