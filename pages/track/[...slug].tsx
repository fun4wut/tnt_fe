import { GetStaticPaths, GetStaticProps, GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { fetchFrom, getIconFromStatus } from '@lib/utils'
import { ShipHistory } from '@lib/types'
import { Carrier } from '@lib/constants'
import { ActivityItem, Text, Spinner, SpinnerSize,AutoScroll } from '@fluentui/react'
import moment from 'moment'
import { CSSProperties } from 'react'

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
      <Spinner
        styles={{
          circle: {width: 70, height: 70},
          label: {fontSize: 18}
        }}
        size={SpinnerSize.large}
        label="Loading..."
        labelPosition="bottom"
      />
    )
  }

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

  const dom = histories.map(singleEvent)

  return (
    <div style={styles.root}>
      <div style={{
        transform: dom.length <= 1 ? "scale(1.5,1.5)" : "none"
      }}>
        {dom}
      </div>
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
  let histories: ShipHistory[]
  try {
    histories = await fetchFrom(carrier as Carrier, trackingNum)
    if (histories[0].status === '') {
      throw new Error("status cannot be empty")
    }
  } catch (error) {
    console.error(error)
    histories = [{
      location: "Unknown",
      status: "Invalid",
      time: "-----"
    }]
  }
  return {
    props: {
      histories
    } as Props,
    revalidate: 1
  }
}

// export const getServerSideProps: GetServerSideProps = async ({ params }) => {
//   const { slug: [carrier, trackingNum] } = params
//   const histories = await fetchFrom(carrier as Carrier, trackingNum)
//   return {
//     props: {
//       histories
//     }
//   }
// }

export default ShipmentLocation

