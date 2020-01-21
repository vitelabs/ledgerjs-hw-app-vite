# ledgerjs-hw-app-vite

Library for interacting with the Ledger VITE app from the browser or Node.

## Module Import

```javascript
import Vite from "ledgerjs-hw-app-vite";
const vite = new Vite(transport);
```
## API

### getAppConfig
获取固件版本号以及 builtin token 数量。

#### Parameters
None

#### Examples

```javascript
const result = await vite.getAppConfig();
```
Returns Promise<{version: string, builtinTokenCount: Uint16}>

### getBuiltinTokenInfo
获取内置 token info，仅用于测试固件的代码。

#### Parameters

-   `index` **number** 内置 token index，从0开始，最大为 builtinTokenCount-1

#### Examples

```javascript
const result = await vite.getBuiltinTokenInfo(0);
```
Returns Promise<{tokenId: TokenId, decimals: number, symbolAndIndex: string}>

### getTestAmountText
测试 amount 展示信息的正确性，仅用于测试固件的代码。

#### Parameters

-   `amount` **BigInt** 
-   `tokenId` **TokenId** 

#### Examples

```javascript
const amountText = await vite.getTestAmountText('1234567890123456789', 'tti_5649544520544f4b454e6e40');
```
Returns Promise&lt;string>

### getAddress
获取地址及其公钥。

#### Parameters

-   `accountIndex` **number** 账户序号，从0开始
-   `boolDisplay` **boolean** 是否在屏幕上显示地址

#### Examples

```javascript
const result = await getAddress(accountIndex, false);
const result = await getAddress(accountIndex, true);
```
Returns Promise<{publicKey: Base64, address: Address}>

### signResponseAccountBlock
sign response account block

#### Parameters

-   `accountIndex` **number** 账户序号，从0开始
-   `height` **Uint64** account block height
-   `sendBlockHash` **Hex** send block hash
-   `previousHash？` **Hex** previous account block hash
-   `nonce？` **Base64** nonce

#### Examples

```javascript
const signResult = await vite.signResponseAccountBlock(0, 1, "1e3004d74382a8635b836eb8a3e34ede7c00a7a1bff0c150974c1235287ad07a", null, "4KVvCafscbA=");
```
Returns Promise<{blockHash: Hex, signature: Base64}>

### signRequestAccountBlock
sign request account block

#### Parameters

-   `accountIndex` **number** 账户序号，从0开始
-   `height` **Uint64** account block height
-   `toAddress` **Address** to address
-   `amount` **BigInt** amount
-   `tokenId` **TokenId** token ID
-   `data?` **Base64?** data
-   `fee?` **BigInt** fee
-   `previousHash？` **Hex** previous account block hash
-   `nonce？` **Base64** nonce

#### Examples

```javascript
const signResult = await vite.signRequestAccountBlock(0, 4, 'vite_847e1672c9a775ca0f3c3a2d3bf389ca466e5501cbecdb7107', '1000000000000000000', 'tti_5649544520544f4b454e6e40', null, null, '1e3004d74382a8635b836eb8a3e34ede7c00a7a1bff0c150974c1235287ad07a', null);
```
Returns Promise<{blockHash: Hex, signature: Base64}>