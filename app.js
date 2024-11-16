import {
  app,
  route
} from './utils'

app.register('duxapp')

export default {
  show: (...arg) => {
    route.showInit(...arg)
  }
}
