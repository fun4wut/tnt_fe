import request from 'superagent'
import { Carrier, DHL_URL, FEDEX_URL, UPS_URL } from './constants'
import { ShipHistory } from './types'
import moment from 'moment'

function fetchFromDHL(trackingNum: string): Promise<ShipHistory[]> {
  return request
    .get("https://tnt220200715165637.azurewebsites.net/api/Shipment")
    .query({ trackNum: trackingNum })
    .set({
      Accept: "*/*",
      Connection: "keep-alive"
    })
    .then(res => JSON.parse(res.text))
    .then(res => res.results[0].checkpoints)
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
      return Promise.resolve([{
        location: "Unknown",
        status: "Invalid",
        time: "-----"
      }] as ShipHistory[])
  }
}
