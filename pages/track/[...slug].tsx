import { GetStaticPaths, GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { fetchFrom } from '@lib/utils'
import { ShipHistory } from '@lib/types'
import { Carrier } from '@lib/constants'
import * as styles from '@styles/track'

type Props = {
  histories: Array<ShipHistory>
  carrier: Carrier
  trackingNum: string
}


const ShipmentLocation = ({ histories }: Props) => {
  const router = useRouter()
  if (router.isFallback) {
    return <div>Loading...</div>
  }

  const singleEvent = (evt: ShipHistory) => (
    <div style={styles.basicBlock} key={evt.location}>
      <div>{evt.location}</div>
      <div>{evt.status}</div>
      <div>{evt.time}</div>
      <div style={styles.dividLine}></div>
    </div>
  )

  return (
    <div style={styles.root}>
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

