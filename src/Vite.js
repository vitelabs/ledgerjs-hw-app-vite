import { BaseAPI } from "../lib/api";
import Transport from "@ledgerhq/hw-transport";
import BIPPath from "bip32-path";
import {
    abi, error, keystore, utils, constant,
    accountBlock, ViteAPI, wallet
} from '@vite/vitejs';

export default class Vite extends BaseAPI {
    constructor(transport: Transport<*>) {
        super(transport, {
            coinName: "Vite",
            addressPrimaryPrefix: "vite_",
            addressSecondaryPrefix: "vite_"
        })
    }

    async signReceiveAccountBlock(
        accountIndex: int,
        prevHash?: Hex,
        height: Uint64,
        fromHash: Hex,
        nonce?: Base64
    ): Promise<{|
        hash: Hex,
        signature: Base64
    |}> {
        const path = `44'/666666'/${accountIndex}'`;
        const bipPath = BIPPath.fromString(path).toPathArray();

        const cla = 0xa1;
        const ins = 0x03;
        const p1 = 0x00;
        const p2 = 0x00;

        let size = 1 + 4 * bipPath.length; // bipPath
        size += 32; // prevHash
        size += 8; // height
        size += 32; // fromHash
        size += 8; // nonce

        let ptr = 0;
        let buf = Buffer.alloc(size);

        buf.writeUInt8(bipPath.length, ptr);
        ptr += 1;
        bipPath.forEach((segment, _) => {
            buf.writeUInt32BE(segment, ptr);
            ptr += 4;
        });

        if (prevHash) {
            ptr += buf.write(prevHash, ptr, buf.length - ptr, "hex");
        } else {
            ptr += buf.write("0000000000000000000000000000000000000000000000000000000000000000", ptr, buf.length - ptr, "hex");
        }

        ptr += buf.write(accountBlock.utils.getHeightHex(height), ptr, buf.length - ptr, "hex");
        ptr += buf.write(fromHash, ptr, buf.length - ptr, "hex");

        if (nonce) {
            ptr += buf.write(nonce, ptr, buf.length - ptr, "Base64");
        } else {
            ptr += buf.write("0000000000000000", ptr, buf.length - ptr, "hex");
        }

        buf = await this.transport.send(cla, ins, p1, p2, buf);
        ptr = 0;

        ptr += 32;
        const blockHash = buf.slice(ptr - 32, ptr).toString("hex");

        ptr += 64;
        const signature = buf.slice(ptr - 64, ptr).toString("Base64");

        return {
            blockHash,
            signature
        };
    }


    async getAddress(
        accountIndex: int,
        boolDisplay?: Boolean
    ): Promise<{|
        publicKey: Base64,
        address: Address
    |}> {
        const path = `44'/666666'/${accountIndex}'`;
        const bipPath = BIPPath.fromString(path).toPathArray();

        const cla = 0xa1;
        const ins = 0x02;
        const p1 = boolDisplay ? 0x01 : 0x00;
        const p2 = 0x00;

        let size = 1 + 4 * bipPath.length; // bipPath

        let buf = Buffer.alloc(size);
        buf.writeUInt8(bipPath.length, 0);
        bipPath.forEach((segment, index) => {
            buf.writeUInt32BE(segment, 1 + 4 * index);
        });

        buf = await this.transport.send(cla, ins, p1, p2, buf);
        let ptr = 0;

        ptr += 32;
        const publicKey = buf.slice(ptr - 32, ptr).toString("base64");

        const addressLength = buf.readUInt8(ptr);
        ptr += 1 + addressLength;
        const address = buf.slice(ptr - addressLength, ptr).toString("ascii");

        return {
            publicKey,
            address
        };
      }
}