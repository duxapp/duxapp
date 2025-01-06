import { route } from '@/duxapp/utils'
import WeebviewComp from './common/webview'
import './index.scss'

export default function WebViewPage() {

  const { params } = route.useRoute()

  return <WeebviewComp url={params.url} />
}
