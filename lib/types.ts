export enum ShipStatus {
    Delivered, Shipped
}

export type ShipHistory = {
    status: ShipStatus
    time: string
    location: string
}

