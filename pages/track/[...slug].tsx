import { GetStaticPaths, GetStaticProps, GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { fetchFrom, getIconFromStatus } from '@lib/utils'
import { ShipHistory } from '@lib/types'
import { Carrier } from '@lib/constants'
import { ActivityItem, Text, Spinner, SpinnerSize,AutoScroll } from '@fluentui/react'
import moment from 'moment'
import { useRef, useEffect, CSSProperties } from 'react'

type Props = {
  histories: Array<ShipHistory>
  carrier: Carrier
  trackingNum: string
}

const styles: Record<string, CSSProperties> = ({
  root: {
    // display: "flex",
    // justifyContent: "center",
    // alignItems: "center",
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
      <Spinner size={SpinnerSize.medium} label="Loading..." labelPosition="bottom" />
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
      activityIcon={<i className={`ms-Icon ms-Icon--${getIconFromStatus(evt.status)}`} style={styles.icons} />}
      timeStamp={moment(evt.time).fromNow()}
      styles={{
        root: {
          margin: 10
        }
      }}
    />
  )

  return (
    <div style={styles.root} ref={rootRef}>
      <div>
        {histories.map(singleEvent)}
      </div>
    </div>
  )

}

// export const getStaticPaths: GetStaticPaths = async () => {
//   return {
//     paths: [],
//     fallback: true
//   }
// }

// export const getStaticProps: GetStaticProps = async ({ params }) => {
//   const { slug: [carrier, trackingNum] } = params

//   return {
//     props: {
//       histories: await fetchFrom(carrier as Carrier, trackingNum)
//     } as Props,
//     revalidate: 1
//   }
// }

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const { slug: [carrier, trackingNum] } = params
  const histories = await fetchFrom(carrier as Carrier, trackingNum)
  return {
    props: {
      histories
    }
  }
}

export default ShipmentLocation

