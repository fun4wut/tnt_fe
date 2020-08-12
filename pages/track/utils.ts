import request from 'superagent'
import { Carrier, DHL_URL } from './constants'

export const fetchFromDHL = (trackingNum: number) => {
    return request
        .get(DHL_URL)
        .query({ AWB: trackingNum })
        .set({
            Accept: "*/*",
            Connection: "keep-alive"
        })
        .then(res => JSON.parse(res.text))
}


export const fetchFromFedex = (trackingNum: number) => {
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
            .then(res => JSON.parse(res.text))
}

export const fetchFromUPS = (trackingNum: number) => {
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
        .then(res => JSON.parse(res.text))
}