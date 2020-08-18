import request from 'superagent'
import { Carrier, DHL_URL, FEDEX_URL, UPS_URL } from './constants'
import { ShipHistory } from './types'
import moment from 'moment'

function fetchFromDHL(trackingNum: string): Promise<ShipHistory[]> {
  return request
    .get(DHL_URL)
    .query({ AWB: trackingNum })
    .set({
      Accept: "*/*",
      Connection: "keep-alive",
      "Accept-Encoding": "gzip, deflate, br",
      Cookie: "bm_sz=F0DF143AFE4E3DA9E2C15B583EBE04F6~YAAQcugyF89e9/FzAQAALQa9/wiLOTlYOGGQcVLxVPq2nRvd69j0YzxrXkfoY7V2O3O/zg0XjqZWhUHnzSa8t5h+FuckJw7/lJypL0RM5Ha4eS+8NRFlHM0P+ywosfScZ1y/48vrjijQtiEyVXH0RhEobAEPLdxhe641SHU7dYYAnLP+tLSPr8emWx8N; TS016f3c0b=01914b743ddcb6a7940e9b5adca49773db7effd90fc6f2102aa2c2035a90fc8dad61b14a6dd79450315812764bd213afcee19c2c66; _abck=B757BF70FE97A6995B9A944976571CE9~-1~YAAQcugyF61f9/FzAQAAM2O+/wRnx5ug9bQKNnAgZhRV6fWnVF/k/GxVy7c40sU2a2mzIThOUE2OP7+oNNf0U/mvCfDCOVhZzH/sywLjazJCuyXab7nvOf53h+Vw8xPufTOZG/p88moCV1IXo/4XE2WdM91ns6A8N7te0EzJ4F6CNTn3oHK73eYQE+qNZQkUEzeJNWAA8h2N3Z7qHZQmcysnNmuSQyvi2FisMaWVNUlDFLpS7dQnJYU5js1DJTyYCUPXoveq4DDzzYZ/+qBH5i9KEgrYPsJmreaSn5MYm3i/viOX4gu4i2FK9Iu3Z4l43VA06g==~0~-1~-1"
    })
    .timeout(3000)
    .then(res => JSON.parse(res.text).results[0].checkpoints)
    .then(list => list.map(evt => ({
      location: evt.location,
      status: evt.description,
      time: moment(`${evt.date} ${evt.time}`, "LLLL").toISOString()
    } as ShipHistory)))
}


function fetchFromFedex(trackingNum: string): Promise<ShipHistory[]> {
  const data = {
    TrackPackagesRequest: {
      trackingInfoList: [{
        trackNumberInfo: {
          trackingNumber: trackingNum
        }
      }]
    }
  }
  return request
    .post(FEDEX_URL)
    .type("form")
    .send({
      data: JSON.stringify(data),
      action: "trackpackages"
    })
    .then(res => JSON.parse(res.text).TrackPackagesResponse.packageList[0].scanEventList)
    .then(list => list.map(evt => ({
      status: evt.status,
      time: moment(`${evt.date} ${evt.time}`, "YYYY-MM-DD hh:mm:ss").toISOString(),
      location: evt.scanLocation
    } as ShipHistory)))
}

function fetchFromUPS(trackingNum: string): Promise<ShipHistory[]> {
  return request
    .post(UPS_URL)
    .set({
      Accept: "*/*",
      Connection: "keep-alive",
      "User-Agent": "PostmanRuntime/7.26.2"
    })
    .send({
      Locale: "en_US",
      TrackingNumber: [trackingNum]
    })
    .then(res => JSON.parse(res.text).trackDetails[0].shipmentProgressActivities)
    .then(list => list.map(evt => ({
      status: evt.activityScan,
      location: evt.location,
      time: moment(`${evt.date} ${evt.time}`, "DD/MM/YYYY LT").toISOString()
    } as ShipHistory)))
}

export function getIconFromStatus(status: string) {
  const s = status.toLowerCase()
  if (s.includes("delivered")) {
    return "ReminderPerson"
  } else if (s.includes("vehicle")|| s.includes("out for")) {
    return "DeliveryTruck"
  } else if (s.includes("transit")) {
    return "Airplane"
  } else if (s.includes("Scan")) {
    return "GenericScan"
  } else if (s.includes("picked")) {
    return "Manufacturing"
  } else if (s.includes("arrive")) {
    return "Arrivals"
  } else {
    return "POI"
  }
}

export function fetchFrom(carrier: Carrier, trackingNum: string) {
  switch (carrier.toLowerCase()) {
    case "dhl":
      return fetchFromDHL(trackingNum)
    case "fedex":
      return fetchFromFedex(trackingNum)
    case "ups":
      return fetchFromUPS(trackingNum)
    default:
      return [{
        location: "Unknown",
        status: "Invalid",
        time: "-----"
      }] as ShipHistory[]
  }
}
