import { GetStaticPaths, GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { fetchFrom, getIconFromStatus } from '@lib/utils'
import { ShipHistory } from '@lib/types'
import { Carrier } from '@lib/constants'
import { mergeStyleSets, ActivityItem, Text, FontIcon, Label, Spinner, SpinnerSize, ShimmerElementsGroup, ShimmerElementType, Shimmer, AutoScroll } from '@fluentui/react'
import moment from 'moment'
import { useRef, useEffect } from 'react'

type Props = {
  histories: Array<ShipHistory>
  carrier: Carrier
  trackingNum: string
}

const styles = mergeStyleSets({
  root: {
    backgroundColor: "white"
  },
  divideLine: {
    height: 0.5,
    marginTop: 5,
    backgroundColor: "teal"
  },
  basicBlock: {

  },
  icons: {
    fontSize: 20,
    height: 20,
    width: 20,
    marginRight: 5,
    marginTop: 5,
  }
})

const ShipmentLocation = ({ histories }: Props) => {
  const router = useRouter()
  if (router.isFallback) {
    return (
        <Text>Loading...</Text>
    )
  }

  const rootRef = useRef<HTMLDivElement>()
  useEffect(() => {
    const scroll = new AutoScroll(rootRef.current)
    return () => {
      scroll.dispose()
    }
  }, [])

  const singleEvent = (evt: ShipHistory) => (
    <ActivityItem
      key={evt.location}
      activityDescription = {<Text>{evt.location}</Text>}
      comments={<Text>{evt.status}</Text>}
      activityIcon={<FontIcon iconName={getIconFromStatus(evt.status)} className={styles.icons} />}
      timeStamp={moment(evt.time).fromNow()}
      styles={{
        root: {
          margin: 10
        }
      }}
    />
  )

  return (
    <div className={styles.root} ref={rootRef}>
      {histories.map(singleEvent)}
    </div>
  )

}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug: [carrier, trackingNum] } = params

  return {
    props: {
      histories: await fetchFrom(carrier as Carrier, trackingNum)
    } as Props,
    revalidate: 1
  }
}

export default ShipmentLocation

