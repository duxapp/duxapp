import { Image, Swiper, SwiperItem, Video } from '@tarojs/components'
import { useRef, useState } from 'react'
import { isIphoneX } from '@/duxapp/utils'
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native'
import { PullView } from '../../PullView'
import { TopView } from '../../TopView'

export const previewMedia = option => {
  const { remove } = TopView.add([
    PreviewMedia,
    {
      ...option,
      onClose: () => {
        remove()
      }
    }
  ])
}

const PreviewMedia = ({ onClose, sources, current = 0 }) => {

  const [select, setSelect] = useState(current)

  const size = Dimensions.get('window')

  const ref = useRef()

  return <PullView ref={ref} side='center' onClose={onClose} overlayOpacity={0.8}>
    <View>
      <Swiper current={select}
        onChange={e => setSelect(e.detail.current)}
        style={{
          width: size.width,
          height: size.height
        }}
      >
        {
          sources.map((item, index) => <SwiperItem key={index}>
            {
              item.type === 'video' ?
                (select === index ? <Video src={item.url}
                  poster={item.poster}
                  style={styles.full}
                  autoplay
                  controls={false}
                  showPlayBtn={false}
                  showFullscreenBtn={false}
                  showCenterPlayBtn={false}
                  enableProgressGesture={false}
                  showBottomProgress={false}
                  objectFit='contain'
                  loop
                /> : <View style={[styles.full, styles.black]} />) :
                <Image src={item.url} mode='aspectFit' style={styles.full} />
            }
          </SwiperItem>)
        }
      </Swiper>
      <Pressable style={styles.close} onPress={() => ref.current.close()}>
        <Text style={styles.closeText}>{select + 1}/{sources.length} 关闭</Text>
      </Pressable>
    </View>
  </PullView>
}

const styles = StyleSheet.create({
  full: {
    width: '100%',
    height: '100%'
  },
  black: {
    backgroundColor: '#000'
  },
  close: {
    position: 'absolute',
    right: 20,
    bottom: isIphoneX() ? 100 : 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  closeText: {
    fontSize: 16,
    color: '#fff'
  }
})
