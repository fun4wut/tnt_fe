import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next'
import { useRouter } from 'next/router'
import { fetchFromDHL, fetchFromFedex, fetchFromUPS } from '@lib/utils'
import { ShipHistory, ShipStatus } from '@lib/types'

type Props = {
  histories: Array<ShipHistory>
}


const ShipmentLocation = ({ histories }: Props) => {
  const router = useRouter()
  if (router.isFallback) {
    return <div>Loading...</div>
  }

  return (
    <div>

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
      histories: []
    } as Props,
    revalidate: 1
  }
}

export default ShipmentLocation

