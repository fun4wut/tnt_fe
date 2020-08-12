import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next'
import { useRouter } from 'next/router'
import { Carrier } from './constants'
import { fetchFromDHL } from './utils'

type ShipmentInfo = {
  carrier: string
  trackingNum: string
  json: string
}


const ShipmentLocation = (props: ShipmentInfo) => {
  const router = useRouter()
  if (router.isFallback) {
    return <div>Loading...</div>
  }

  return (
    <div>
      {props.carrier}
      {props.trackingNum}
      {props.json}
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

  const demo: ShipmentInfo = {
    carrier,
    trackingNum,
    json: 'ruaaa'
  }
  return {
    props: demo,
    revalidate: 1
  }
}

export default ShipmentLocation

