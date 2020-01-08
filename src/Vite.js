import { BaseAPI } from "../lib/api";
import Transport from "@ledgerhq/hw-transport";


export default class Vite extends BaseAPI {
    constructor(transport: Transport<*>) {
        super(transport, {
            coinName: "Vite",
            addressPrimaryPrefix: "vite_",
            addressSecondaryPrefix: "vite_"
        })
    }

    
}