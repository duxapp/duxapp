import { useRoute } from '@/duxapp/utils'
import WeebviewComp from './common/webview'
import './index.scss'

export default function WebViewPage() {

  const { params } = useRoute()

  return <WeebviewComp url={params.url} />
}
