import Transport from "@ledgerhq/hw-transport";
import BIPPath from "bip32-path";
import { accountBlock as AccountBlock } from '@vite/vitejs';

export declare type int = number;
export declare type Hex = string;
export declare type Address = string;
export declare type Base64 = string;
export declare type TokenId = string;
export declare type Int32 = string;
export declare type Int64 = string;
export declare type Uint8 = string;
export declare type Uint16 = string;
export declare type Uint32 = string;
export declare type Uint64 = string;
export declare type Uint256 = string;
export declare type BigInt = string;
export declare type Bytes32 = string;

export default class Vite {
    transport: Transport;
    constructor(transport: Transport) {
        transport.setScrambleKey("VITE");
        this.transport = transport;
    }

    async signSendAccountBlock(
        accountIndex: int,
        height: Uint64,
        toAddress: Address,
        amount: BigInt,
        tokenId: TokenId,
        prevHash?: Hex,
        fee?: BigInt,
        data?: Base64,
        nonce?: Base64
    ) {

        const dataBuffer = data ? Buffer.from(data, 'base64') : Buffer.alloc(0);
        let dataBufferPtr = 0;

        async function send(): Promise<{
            blockHash: Hex,
            signature: Base64
        }> {
            const maxDataSizeInCacheSendBlockDataAPDU = 224;
            const maxDataSizeInSignSendBlock = 64;
            let remain = dataBuffer.length - dataBufferPtr;

            if (remain > maxDataSizeInSignSendBlock) {

                const cla = 0xa1;
                const ins = 0x04;
                const p1 = (dataBufferPtr == 0) ? 0x01 : 0x02;
                const p2 = 0x00;

                let length = Math.min(remain, maxDataSizeInCacheSendBlockDataAPDU);
                let buf = dataBuffer.slice(dataBufferPtr, dataBufferPtr + length);
                dataBufferPtr += length;
                console.log(length, buf.length);
                await this.transport.send(cla, ins, p1, p2, buf);

                return await send.call(this);
            } else {

                const path = `44'/666666'/${accountIndex}'`;
                const bipPath = BIPPath.fromString(path).toPathArray();

                const cla = 0xa1;
                const ins = 0x05;
                const p1 = (dataBufferPtr == 0) ? 0x02 : 0x01;
                const p2 = 0x00;

                let size = 1 + 4 * bipPath.length; // bipPath
                size += 32; // prevHash
                size += 8; // height
                size += 21; // toAddress
                size += 32; // amount
                size += 10; // tokenId
                size += 32; // fee
                size += 8; // nonce
                size += remain; // data

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

                ptr += buf.write(AccountBlock.utils.getHeightHex(height), ptr, buf.length - ptr, "hex");
                ptr += buf.write(AccountBlock.utils.getAddressHex(toAddress), ptr, buf.length - ptr, "hex");
                ptr += buf.write(AccountBlock.utils.getAmountHex(amount), ptr, buf.length - ptr, "hex");
                ptr += buf.write(AccountBlock.utils.getTokenIdHex(tokenId), ptr, buf.length - ptr, "hex");

                if (fee) {
                    ptr += buf.write(AccountBlock.utils.getAmountHex(fee), ptr, buf.length - ptr, "hex");
                } else {
                    ptr += buf.write(AccountBlock.utils.getAmountHex(BigInt(0)), ptr, buf.length - ptr, "hex");
                }

                if (nonce) {
                    ptr += buf.write(nonce, ptr, buf.length - ptr, "base64");
                } else {
                    ptr += buf.write("0000000000000000", ptr, buf.length - ptr, "hex");
                }

                if (remain > 0) {
                    dataBuffer.copy(buf, ptr, dataBufferPtr, dataBufferPtr + remain);
                    dataBufferPtr += remain;
                    ptr += remain;
                }

                buf = await this.transport.send(cla, ins, p1, p2, buf);
                ptr = 0;

                ptr += 32;
                const blockHash = buf.slice(ptr - 32, ptr).toString("hex");

                ptr += 64;
                const signature = buf.slice(ptr - 64, ptr).toString("base64");

                return {
                    blockHash,
                    signature
                };
            }
        }
        return await send.call(this)
    }

    async signReceiveAccountBlock(
        accountIndex: int,
        height: Uint64,
        fromHash: Hex,
        prevHash?: Hex,
        nonce?: Base64
    ): Promise<{
        blockHash: Hex,
        signature: Base64
    }> {
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

        ptr += buf.write(AccountBlock.utils.getHeightHex(height), ptr, buf.length - ptr, "hex");
        ptr += buf.write(fromHash, ptr, buf.length - ptr, "hex");

        if (nonce) {
            ptr += buf.write(nonce, ptr, buf.length - ptr, "base64");
        } else {
            ptr += buf.write("0000000000000000", ptr, buf.length - ptr, "hex");
        }

        buf = await this.transport.send(cla, ins, p1, p2, buf);
        ptr = 0;

        ptr += 32;
        const blockHash = buf.slice(ptr - 32, ptr).toString("hex");

        ptr += 64;
        const signature = buf.slice(ptr - 64, ptr).toString("base64");

        return {
            blockHash,
            signature
        };
    }


    async getAddress(
        accountIndex: int,
        boolDisplay?: Boolean
    ): Promise<{
        publicKey: Base64,
        address: Address
    }> {
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


    async getAppConfig(): Promise<{
        version: string,
        builtinTokenCount: Uint16
    }> {

        const cla = 0xa1;
        const ins = 0x01;
        const p1 = 0x00;
        const p2 = 0x00;

        let buf = Buffer.alloc(0);
        buf = await this.transport.send(cla, ins, p1, p2, buf);

        let version = `${buf[0]}.${buf[1]}.${buf[2]}`;
        let builtinTokenCount = `${buf[3] * 256 + buf[4]}`;

        return {
            version,
            builtinTokenCount
        };
    }

    async getBuiltinTokenInfo(index) {
        const cla = 0xa1;
        const ins = 0x06;
        const p1 = 0x00;
        const p2 = 0x00;

        let buf = Buffer.from([index / 256, index % 256]);
        buf = await this.transport.send(cla, ins, p1, p2, buf);

        const tokenId = buf.slice(0, 28).toString("ascii");
        const decimals = buf[28];
        const symbolAndIndex = buf.slice(29, buf.length - 2).toString("ascii");

        return {
            tokenId,
            decimals,
            symbolAndIndex
        };
    }

    async getTestAmountText(amount, tokenId) {

        const cla = 0xa1;
        const ins = 0x07;
        const p1 = 0x00;
        const p2 = 0x00;

        let size = 32; // amount
        size += 10; // tokenId

        let ptr = 0;
        let buf = Buffer.alloc(size);

        ptr += buf.write(AccountBlock.utils.getAmountHex(amount), ptr, buf.length - ptr, "hex");
        ptr += buf.write(AccountBlock.utils.getTokenIdHex(tokenId), ptr, buf.length - ptr, "hex");
        buf = await this.transport.send(cla, ins, p1, p2, buf);
        const text = buf.slice(0, buf.length - 2).toString("ascii");
        return text;
    }
}