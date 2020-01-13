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

let transport;
let provider;
let vite;

beforeAll(async function(){
  transport = await Transport.create();
  vite = new Vite(transport);
  provider = new ViteAPI(new HTTP_RPC('http://148.70.30.139:48132'), () => {
   console.log('Connetct');
 });
})

async function getAddress(accountIndex, boolDisplay) {
  const result = await vite.getAddress(accountIndex, boolDisplay);
  console.log('getAddress', result);
  return result;
}

async function getCurrentHeightAndPreviousHash(accountAddress) {
  const latestAccountBlock = await provider.request('ledger_getLatestAccountBlock', accountAddress);
  let previousHash = "0000000000000000000000000000000000000000000000000000000000000000";
  let height = 1;
  if (latestAccountBlock) {
    height = Number(latestAccountBlock.height) + 1;
    previousHash = latestAccountBlock.hash;
  }

  let result = {
    "height": height,
    "previousHash": previousHash
  }

  console.log('getCurrentHeightAndPreviousHash', result);
  return result;
}

async function getPoWDifficultyForSend(accountAddress, previousHash, toAddress, data) {
  try {
    const powDifficulty = await provider.request('ledger_getPoWDifficulty', {
      "address":accountAddress,
      "previousHash": previousHash,
      "blockType":2,
      "toAddress": toAddress,
      "data": data
    })

    let result = null;
    if (powDifficulty.difficulty.length > 0) {
      result = powDifficulty.difficulty;
    }
    console.log('getPoWDifficultyForSend', result);
    return result;
  } catch(err) {
    if (err.error.code == -35005) {
      console.log('need sleep');
      await new Promise(resolve => setTimeout(resolve, 2000));
      return await getPoWDifficultyForSend(accountAddress, previousHash, toAddress, data);
    } else {
      throw err;
    }
  }
}

async function getPoWNonce(accountAddress, previousHash, difficulty) {
  const source = accountBlock.utils.getAddressHex(accountAddress) + previousHash;
  const hash = blake.blake2bHex(Buffer.from(source, 'hex'), null, 32)
  const result = await provider.request('util_getPoWNonce', difficulty, hash)
  console.log('getPoWNonce', result);
  return result;
}

async function signSendBlockAndSendWithAccountIndex(accountIndex, toAddress, amount, tokenId, fee, data) {
  const _accountResult = await getAddress(accountIndex, false);
  let publicKey = _accountResult.publicKey;
  let accountAddress = _accountResult.address;

  return await signSendBlockAndSend(accountAddress, publicKey, toAddress, amount, tokenId, fee, data);
}

async function signSendBlockAndSend(accountAddress, publicKey, toAddress, amount, tokenId, fee, data) {

  const _getCurrentHeightAndPreviousHashResult = await getCurrentHeightAndPreviousHash(accountAddress);
  let previousHash = _getCurrentHeightAndPreviousHashResult.previousHash;
  let height = _getCurrentHeightAndPreviousHashResult.height;

  let nonce = null;
  let difficulty = await getPoWDifficultyForSend(accountAddress, previousHash, toAddress, data);
  if (difficulty) {
    console.log('need pow', difficulty);
    nonce = await getPoWNonce(accountAddress, previousHash, difficulty);
  } else {
    console.log('no need pow');
    difficulty = null;
  }

  const signResult = await vite.signSendAccountBlock(accountIndex, previousHash, height, toAddress, amount, tokenId, fee, data, nonce)
  const blockHash = signResult.blockHash;
  const signature = signResult.signature;

  let sendBlock = {
    "previousHash": previousHash,
    "publicKey": publicKey,
    "address": accountAddress,
    "signature": signature,
    "height": `${height}`,
    "nonce": nonce,
    "fee": fee,
    "hash": blockHash,

    "toAddress": toAddress,
    "amount": amount,
    "tokenId": tokenId,
    "data": data,

    "blockType": 2,
    "difficulty": difficulty
    
  };
  console.log('sendBlock', sendBlock);
  const result = await provider.request('ledger_sendRawTransaction', sendBlock);
  return result;
}

async function getFirstUnreceivedBlock(accountAddress) {
  const unreceivedBlocks = await provider.request('ledger_getUnreceivedBlocksByAddress', accountAddress, 0, 1);
  if (unreceivedBlocks.length > 0) {
    return unreceivedBlocks[0]
  } else {
    return null;
  }
}

async function getPoWDifficultyForReceive(accountAddress, previousHash) {
  try {
    const powDifficulty = await provider.request('ledger_getPoWDifficulty', {
      "address":accountAddress,
      "previousHash": previousHash,
      "blockType": 4
    })

    let result = null;
    if (powDifficulty.difficulty.length > 0) {
      result = powDifficulty.difficulty;
    }
    console.log('getPoWDifficultyForReceive', result);
    return result;
  } catch(err) {
    if (err.error.code == -35005) {
      console.log('need sleep');
      await new Promise(resolve => setTimeout(resolve, 2000));
      return await getPoWDifficultyForReceive(accountAddress, previousHash);
    } else {
      throw err;
    }
  }
}

async function signReceiveBlockAndSend(accountAddress, publicKey, sendBlockHash) {
  const _getCurrentHeightAndPreviousHashResult = await getCurrentHeightAndPreviousHash(accountAddress);
    let previousHash = _getCurrentHeightAndPreviousHashResult.previousHash;
    let height = _getCurrentHeightAndPreviousHashResult.height;

    let nonce = null;
    let difficulty = await getPoWDifficultyForReceive(accountAddress, previousHash);
    if (difficulty) {
      console.log('need pow', difficulty);
      nonce = await getPoWNonce(accountAddress, previousHash, difficulty);
    } else {
      console.log('no need pow');
      difficulty = null;
    }

    const signResult = await vite.signReceiveAccountBlock(accountIndex, previousHash, height, sendBlockHash, nonce);
    const blockHash = signResult.blockHash;
    const signature = signResult.signature;

    let receiveBlock = {
      "previousHash": previousHash,
      "publicKey": publicKey,
      "address": accountAddress,
      "signature": signature,
      "height": `${height}`,
      "nonce": nonce,
      "hash": blockHash,
      "sendBlockHash": sendBlockHash,
      "blockType": 4,
      "difficulty": difficulty
      
    };
    console.log(receiveBlock);
    const ret = await provider.request('ledger_sendRawTransaction', receiveBlock)
}

async function sendBlock(accountAddress, publicKey, toAddress, amount, tokenId, fee, note) {
  let data = null;
  if (note && note.length > 0) {
    data = Buffer.from(note, 'utf8').toString("base64");
  }
  return await signSendBlockAndSend(accountAddress, publicKey, toAddress, amount, tokenId, fee, data);
}

let accountIndex = 0;

// test("vite.getAddress", async () => {
//   await getAddress(accountIndex, false);
//   await getAddress(accountIndex, true);
// }, 50000000);

// test("vite.signReceiveAccountBlock", async () => {
//   const transport = await Transport.create();
//   const vite = new Vite(transport);
//   const accountResult = await vite.getAddress(accountIndex, false);
//   console.log(accountResult.publicKey);
//   console.log(accountResult.address);

//   const signResult = await vite.signReceiveAccountBlock(0, null, 1, "1e3004d74382a8635b836eb8a3e34ede7c00a7a1bff0c150974c1235287ad07a", "4KVvCafscbA=");
//   console.log(signResult.blockHash);
//   console.log(signResult.signature);

// }, 50000000);

// test("vite.signSendAccountBlock", async () => {
//   try {
//     const _accountResult = await getAddress(accountIndex, false);
//     let publicKey = _accountResult.publicKey;
//     let accountAddress = _accountResult.address;

//     const toAddress = "vite_847e1672c9a775ca0f3c3a2d3bf389ca466e5501cbecdb7107";
//     const tokenId = "tti_5649544520544f4b454e6e40";
//     const fee = "0";

//     const notes = [
//       null,
//       "",
//       "abcdefghijklmnopqrstuvwxyz",
//       "abcdefghijklmnopqrstuvwxyz_ABCDEFGHIJKLMNOPQRSTUVWXYZ-0123456789",
//       "abcdefghijklmnopqrstuvwxyz_ABCDEFGHIJKLMNOPQRSTUVWXYZ-0123456789-haha",
//       "交易所ViteX在4月16日正式上线公测版本。ViteX作为完全去中心化交易所具有链上撮合交易;、链上分红、交易信息链上完全透明、 私钥资产由用户自己保管、交易即挖矿、任何人都可以在ViteX交易所自主上币等特点。ViteX交易所公测地址： https://x-test.vite.net/为了方便您数字资产的保管，在体验交易所公测版本时，需要您重新注册账号，领取测试代币后即可体验交易（钱包的测试代币需要在交易所“资产管理”内充币至交易所）。在公测版本中我们将会开启以下14个交易对：GRIN.T/BTC、ETH/BTC、VITE/BTC、VTT.T/BTC、VTT.T/ETH、VITE/ETH、GRIN.T/ETH、GRIN.T/VITE、VTT.T/VITE、BTC/USDT、ETH/USDT、VITE/USDT、GRIN.T/USDT、VTT.T/USDT。最小交易额分别为：100VITE、0.01ETH，0.0005BTC，1USDT。公测版ViteX交易所仅有Web版本，下面为公测版本截图。",
//       "全球第一个基于DAG的去中心化交易所ViteX在4月16日正式上线公测版本。ViteX作为完全去中心化交易所具有链上撮合交易;、链上分红、交易信息链上完全透明、 私钥资产由用户自己保管、交易即挖矿、任何人都可以在ViteX交易所自主上币等特点。ViteX交易所公测地址： https://x-test.vite.net/为了方便您数字资产的保管，在体验交易所公测版本时，需要您重新注册账号，领取测试代币后即可体验交易（钱包的测试代币需要在交易所“资产管理”内充币至交易所）。在公测版本中我们将会开启以下14个交易对：GRIN.T/BTC、ETH/BTC、VITE/BTC、VTT.T/BTC、VTT.T/ETH、VITE/ETH、GRIN.T/ETH、GRIN.T/VITE、VTT.T/VITE、BTC/USDT、ETH/USDT、VITE/USDT、GRIN.T/USDT、VTT.T/USDT。最小交易额分别为：100VITE、0.01ETH，0.0005BTC，1USDT。公测版ViteX交易所仅有Web版本，下面为公测版本截图。"
//     ];

//     for (let index = 0; index < notes.length; index++) {
//       let amount = `${index}000000000000000000`;
//       const note = notes[index];

//       let dataLength = null;
//       if (note) {
//         dataLength = Buffer.from(note, 'utf8').length
//       }
//       console.log('amount:', index, 'dataLength:', dataLength, 'note:', note);

//       await sendBlock(
//         accountAddress, 
//         publicKey, 
//         toAddress,
//         amount, 
//         tokenId, 
//         fee, 
//         note);
//     }

//   } catch(err) {
//     console.warn(err);
//   }
// }, 50000000); 

test("vite.signLatestReceiveAccountBlock", async () => {

  try {
    const _accountResult = await getAddress(accountIndex, false);
    let publicKey = _accountResult.publicKey;
    let accountAddress = _accountResult.address;

    await signSendBlockAndSend(accountAddress, publicKey, accountAddress, "1000000000000000000", "tti_5649544520544f4b454e6e40", "0", null);

    while (true) {
      const unreceivedBlock = await getFirstUnreceivedBlock(accountAddress);
      if (unreceivedBlock == null) {
        console.log('No unreceivedBlocks');
        return;
      }

      const sendBlockHash = unreceivedBlock.hash;
      await signReceiveBlockAndSend(accountAddress, publicKey, sendBlockHash);
    }

  } catch(err) {
    console.warn(err);
  }

}, 50000000);