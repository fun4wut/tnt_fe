import moduleName, { useRouter } from 'next/router'

const ShipmentLocation = () => {
    const router = useRouter()
    const { all: [carrier, trackingNum] } = router.query
    switch (carrier) {}
}