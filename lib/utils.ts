import request from 'superagent'
import { Carrier, DHL_URL } from './constants'
import { ShipHistory } from './types'
import moment from 'moment'

function fetchFromDHL(trackingNum: string): Promise<ShipHistory[]> {
  return request
    .get(DHL_URL)
    .query({ AWB: trackingNum })
    .set({
      Accept: "*/*",
      Connection: "keep-alive"
    })
    .then(res => JSON.parse(res.text).results[0].checkpoints)
    .then(list => list.map(evt => ({
      location: evt.location,
      status: evt.description,
      time: moment(`${evt.date} ${evt.time}`, "LLLL").toLocaleString()
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
    .post("https://www.fedex.com/trackingCal/track")
    .type("form")
    .send({
      data: JSON.stringify(data),
      action: "trackpackages"
    })
    .then(res => JSON.parse(res.text).TrackPackagesResponse.packageList[0].scanEventList)
    .then(list => list.map(evt => ({
      status: evt.status,
      time: moment(`${evt.date} ${evt.time}`, "YYYY-MM-DD hh:mm:ss").toLocaleString(),
      location: evt.scanLocation
    } as ShipHistory)))
}

function fetchFromUPS(trackingNum: string): Promise<ShipHistory[]> {
  return request
    .post(DHL_URL)
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
      time: moment(`${evt.date} ${evt.time}`, "DD/MM/YYYY LT").toLocaleString()
    } as ShipHistory)))
}

export function fetchFrom(carrier: Carrier, trackingNum: string) {
  switch (carrier) {
    case "dhl":
      return fetchFromDHL(trackingNum)
    case "fedex":
      return fetchFromFedex(trackingNum)
    case "ups":
      return fetchFromUPS(trackingNum)
  }
}