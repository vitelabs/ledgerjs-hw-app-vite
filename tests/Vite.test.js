const { 
  default: Transport 
} = require("@ledgerhq/hw-transport-node-hid");
const {
  default: Nano
} = require("../lib/Nano");
const {
  default: Vite
} = require("../lib/Vite");

const { 
  HTTP_RPC 
} = require('@vite/vitejs-http');

const { 
 ViteAPI, accountBlock 
} = require('@vite/vitejs');

const blake = require('blakejs/blake2b');


// test("vite.getAddress", async () => {
//   let accountIndex = 0
//   const transport = await Transport.create();
//   const vite = new Vite(transport);
//   const result = await vite.getAddress(accountIndex, false);
//   console.log(result.publicKey);
//   console.log(result.address);

// });

// test("vite.signReceiveAccountBlock", async () => {

//   let accountIndex = 0
//   const transport = await Transport.create();
//   const vite = new Vite(transport);
//   const accountResult = await vite.getAddress(accountIndex, false);
//   console.log(accountResult.publicKey);
//   console.log(accountResult.address);

//   const signResult = await vite.signReceiveAccountBlock(0, null, 1, "1e3004d74382a8635b836eb8a3e34ede7c00a7a1bff0c150974c1235287ad07a", "4KVvCafscbA=");
//   console.log(signResult.blockHash);
//   console.log(signResult.signature);

// });

// test("vite.signLatestReceiveAccountBlock", async () => {

//   let accountIndex = 0
//   const transport = await Transport.create();
//   const vite = new Vite(transport);
//   const accountResult = await vite.getAddress(accountIndex, false);
//   let publicKey = accountResult.publicKey;
//   let accountAddress = accountResult.address;

//   // console.log(accountResult.publicKey);
//   console.log(accountAddress);

//   const provider = new ViteAPI(new HTTP_RPC('http://148.70.30.139:48132'), () => {
//     console.log('Connetct');
//   });

//   try {
//     const unreceivedBlocks = await provider.request('ledger_getUnreceivedBlocksByAddress', accountAddress, 0, 1);
//     if (unreceivedBlocks.length > 0) {
//       let unreceivedBlock = unreceivedBlocks[0];
//       const latestAccountBlock = await provider.request('ledger_getLatestAccountBlock', accountAddress)
//       console.log(latestAccountBlock);

//       let previousHash = "0000000000000000000000000000000000000000000000000000000000000000";
//       let height = 1;
//       if (latestAccountBlock) {
//         height = Number(latestAccountBlock.height) + 1;
//         previousHash = latestAccountBlock.hash
//       }

//       console.log(previousHash);
//       const powDifficulty = await provider.request('ledger_getPoWDifficulty', {
//         "address":accountAddress,
//         "previousHash": previousHash,
//         "blockType":4
//       })
//       console.log(powDifficulty);

//       const fromHash = unreceivedBlock.hash;

//       if (powDifficulty.difficulty.length > 0) {
//         const source = accountBlock.utils.getAddressHex(accountAddress) + previousHash;
//         const hash = blake.blake2bHex(Buffer.from(source, 'hex'), null, 32)
//         console.log(source);
//         console.log(hash);
//         const powNonce = await provider.request('util_getPoWNonce', powDifficulty.difficulty, hash)
//         console.log(height);
//         console.log(fromHash);
//         console.log(powNonce);

//         const signResult = await vite.signReceiveAccountBlock(accountIndex, previousHash, height, fromHash, powNonce);
//         const blockHash = signResult.blockHash;
//         const signature = signResult.signature;
//         console.log(blockHash);
//         console.log(signature);

//         let receiveBlock = {
//           "previousHash": previousHash,
//           "publicKey": publicKey,
//           "address": accountAddress,
//           "signature": signature,
//           "height": `${height}`,
//           "nonce": powNonce,
//           "fee": "0",
//           "hash": blockHash,
//           "sendBlockHash": fromHash,
//           "blockType": 4,
//           "difficulty": powDifficulty.difficulty
          
//         };
//         console.log(receiveBlock);
//         const ret = await provider.request('ledger_sendRawTransaction', receiveBlock)

//       } else {

//         const signResult = await vite.signReceiveAccountBlock(accountIndex, previousHash, height, fromHash, null);
//         const blockHash = signResult.blockHash;
//         const signature = signResult.signature;

//         let receiveBlock = {
//           "previousHash": previousHash,
//           "publicKey": publicKey,
//           "address": accountAddress,
//           "signature": signature,
//           "height": `${height}`,
//           "fee": "0",
//           "hash": blockHash,
//           "sendBlockHash": fromHash,
//           "blockType": 4,          
//         };
//         console.log(receiveBlock);
//         const ret = await provider.request('ledger_sendRawTransaction', receiveBlock)
//       }

//     } else {
//       console.log('No unreceivedBlocks');
//     }
//   } catch(err) {
//     console.warn(err);
//   }

// });

test("vite.signSendAccountBlock", async () => {

  let accountIndex = 0
  const transport = await Transport.create();
  var vite = new Vite(transport);
  const accountResult = await vite.getAddress(accountIndex, false);
  let publicKey = accountResult.publicKey;
  let accountAddress = accountResult.address;

  console.log(accountAddress);

  const provider = new ViteAPI(new HTTP_RPC('http://148.70.30.139:48132'), () => {
    console.log('Connetct');
  });

  const toAddress = "vite_ae2c93b85949c7f0788e16dd5ee3fc500d7f1c3252a31f3fa1";
  const amount = "1000000000000000000";
  const tokenId = "tti_5649544520544f4b454e6e40";
  // const dataString = "abcdefghijklmnopqrstuvwxyz_ABCDEFGHIJKLMNOPQRSTUVWXYZ-0123456789_haha";
  // const dataString = "全球第一个基于DAG的去中心化交易所ViteX在4月16日正式上线公测版本。ViteX作为完全去中心化交易所具有链上撮合交易;、链上分红、交易信息链上完全透明、 私钥资产由用户自己保管、交易即挖矿、任何人都可以在ViteX交易所自主上币等特点。ViteX交易所公测地址： https://x-test.vite.net/为了方便您数字资产的保管，在体验交易所公测版本时，需要您重新注册账号，领取测试代币后即可体验交易（钱包的测试代币需要在交易所“资产管理”内充币至交易所）。在公测版本中我们将会开启以下14个交易对：GRIN.T/BTC、ETH/BTC、VITE/BTC、VTT.T/BTC、VTT.T/ETH、VITE/ETH、GRIN.T/ETH、GRIN.T/VITE、VTT.T/VITE、BTC/USDT、ETH/USDT、VITE/USDT、GRIN.T/USDT、VTT.T/USDT。最小交易额分别为：100VITE、0.01ETH，0.0005BTC，1USDT。公测版ViteX交易所仅有Web版本，下面为公测版本截图。";
  // const dataString = "交易所ViteX在4月16日正式上线公测版本。ViteX作为完全去中心化交易所具有链上撮合交易;、链上分红、交易信息链上完全透明、 私钥资产由用户自己保管、交易即挖矿、任何人都可以在ViteX交易所自主上币等特点。ViteX交易所公测地址： https://x-test.vite.net/为了方便您数字资产的保管，在体验交易所公测版本时，需要您重新注册账号，领取测试代币后即可体验交易（钱包的测试代币需要在交易所“资产管理”内充币至交易所）。在公测版本中我们将会开启以下14个交易对：GRIN.T/BTC、ETH/BTC、VITE/BTC、VTT.T/BTC、VTT.T/ETH、VITE/ETH、GRIN.T/ETH、GRIN.T/VITE、VTT.T/VITE、BTC/USDT、ETH/USDT、VITE/USDT、GRIN.T/USDT、VTT.T/USDT。最小交易额分别为：100VITE、0.01ETH，0.0005BTC，1USDT。公测版ViteX交易所仅有Web版本，下面为公测版本截图。";
  const dataString = "hahaha";
  const data = Buffer.from(dataString, 'utf8').toString("base64");

  try {
    const latestAccountBlock = await provider.request('ledger_getLatestAccountBlock', accountAddress);
    console.log(latestAccountBlock);

    let previousHash = "0000000000000000000000000000000000000000000000000000000000000000";
    let height = 1;
    if (latestAccountBlock) {
      height = Number(latestAccountBlock.height) + 1;
      previousHash = latestAccountBlock.hash;
    }

    console.log(previousHash);
    const powDifficulty = await provider.request('ledger_getPoWDifficulty', {
      "address":accountAddress,
      "previousHash": previousHash,
      "blockType":2,
      "toAddress": toAddress,
      "data": data
    })
    console.log(powDifficulty);

    if (powDifficulty.difficulty.length > 0) {
      const source = accountBlock.utils.getAddressHex(accountAddress) + previousHash;
      const hash = blake.blake2bHex(Buffer.from(source, 'hex'), null, 32)
      console.log(source);
      console.log(hash);
      const powNonce = await provider.request('util_getPoWNonce', powDifficulty.difficulty, hash)
      console.log(height);
      console.log(powNonce);
      console.log(toAddress);
      const signResult = await vite.signSendAccountBlock(accountIndex, previousHash, height, toAddress, amount, tokenId, null, data, powNonce)
      
      const blockHash = signResult.blockHash;
      const signature = signResult.signature;
      console.log(blockHash);
      console.log(signature);

      let sendBlock = {
        "previousHash": previousHash,
        "publicKey": publicKey,
        "address": accountAddress,
        "signature": signature,
        "height": `${height}`,
        "nonce": powNonce,
        "fee": "0",
        "hash": blockHash,

        "toAddress": toAddress,
        "amount": amount,
        "tokenId": tokenId,
        "data": data,

        "blockType": 2,
        "difficulty": powDifficulty.difficulty
        
      };
      console.log(sendBlock);
      const ret = await provider.request('ledger_sendRawTransaction', sendBlock);

    } else {

      console.log(toAddress);
      const signResult = await vite.signSendAccountBlock(accountIndex, previousHash, height, toAddress, amount, tokenId, null, data, null)
      const blockHash = signResult.blockHash;
      const signature = signResult.signature;
      let sendBlock = {
        "previousHash": previousHash,
        "publicKey": publicKey,
        "address": accountAddress,
        "signature": signature,
        "height": `${height}`,
        "fee": "0",
        "hash": blockHash,

        "toAddress": toAddress,
        "amount": amount,
        "tokenId": tokenId,
        "data": data,

        "blockType": 2
      };
      console.log(sendBlock);
      const ret = await provider.request('ledger_sendRawTransaction', sendBlock);
    }
  } catch(err) {
    console.warn(err);
  }

}, 500000);


// test("nano.getAddress", async () => {
//   console.log(Nano);
//   console.log(Vite);

//   const getAddress = async () => {
//     const transport = await Transport.create();
//     const nano = new Nano(transport);
//     const result = await nano.getAddress("44'/165'/0'", true);
//     return result.address;
//   };
//   const address = await getAddress();
//   console.log(address);
// });