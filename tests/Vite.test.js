const { default: Transport } = require("@ledgerhq/hw-transport-node-hid");
const { default: Vite } = require("../lib/Vite");
const { HTTP_RPC } = require('@vite/vitejs-http');
const { ViteAPI, accountBlock: AccountBlock } = require('@vite/vitejs');
const blake = require('blakejs/blake2b');
const BigNumber = require('bignumber.js');

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

async function getPoWDifficultyForRequest(accountAddress, previousHash, toAddress, data) {
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
    console.log('getPoWDifficultyForRequest', result);
    return result;
  } catch(err) {
    if (err.error.code == -35005) {
      console.log('need sleep');
      await new Promise(resolve => setTimeout(resolve, 2000));
      return await getPoWDifficultyForRequest(accountAddress, previousHash, toAddress, data);
    } else {
      throw err;
    }
  }
}

async function getPoWNonce(accountAddress, previousHash, difficulty) {
  const source = AccountBlock.utils.getAddressHex(accountAddress) + previousHash;
  const hash = blake.blake2bHex(Buffer.from(source, 'hex'), null, 32)
  const result = await provider.request('util_getPoWNonce', difficulty, hash)
  console.log('getPoWNonce', result);
  return result;
}

async function signRequestBlockAndSendWithAccountIndex(accountIndex, toAddress, amount, tokenId, fee, data) {
  const _accountResult = await getAddress(accountIndex, false);
  let publicKey = _accountResult.publicKey;
  let accountAddress = _accountResult.address;

  return await signRequestBlockAndSend(accountAddress, publicKey, toAddress, amount, tokenId, fee, data);
}

async function signRequestBlockAndSend(accountAddress, publicKey, toAddress, amount, tokenId, fee, data) {

  const _getCurrentHeightAndPreviousHashResult = await getCurrentHeightAndPreviousHash(accountAddress);
  let previousHash = _getCurrentHeightAndPreviousHashResult.previousHash;
  let height = _getCurrentHeightAndPreviousHashResult.height;

  let nonce = null;
  let difficulty = await getPoWDifficultyForRequest(accountAddress, previousHash, toAddress, data);
  if (difficulty) {
    console.log('need pow', difficulty);
    nonce = await getPoWNonce(accountAddress, previousHash, difficulty);
  } else {
    console.log('no need pow');
    difficulty = null;
  }

  const signResult = await vite.signRequestAccountBlock(accountIndex, height, toAddress, amount, tokenId, data, fee, previousHash, nonce)
  const blockHash = signResult.blockHash;
  const signature = signResult.signature;

  let requestBlock = {
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
  console.log('requestBlock', requestBlock);
  const result = await provider.request('ledger_sendRawTransaction', requestBlock);
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

async function getPoWDifficultyForResponse(accountAddress, previousHash) {
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
    console.log('getPoWDifficultyForResponse', result);
    return result;
  } catch(err) {
    if (err.error.code == -35005) {
      console.log('need sleep');
      await new Promise(resolve => setTimeout(resolve, 2000));
      return await getPoWDifficultyForResponse(accountAddress, previousHash);
    } else {
      throw err;
    }
  }
}

async function signResponseBlockAndSend(accountAddress, publicKey, sendBlockHash) {
  const _getCurrentHeightAndPreviousHashResult = await getCurrentHeightAndPreviousHash(accountAddress);
    let previousHash = _getCurrentHeightAndPreviousHashResult.previousHash;
    let height = _getCurrentHeightAndPreviousHashResult.height;

    let nonce = null;
    let difficulty = await getPoWDifficultyForResponse(accountAddress, previousHash);
    if (difficulty) {
      console.log('need pow', difficulty);
      nonce = await getPoWNonce(accountAddress, previousHash, difficulty);
    } else {
      console.log('no need pow');
      difficulty = null;
    }

    const signResult = await vite.signResponseAccountBlock(accountIndex, height, sendBlockHash, previousHash, nonce);
    const blockHash = signResult.blockHash;
    const signature = signResult.signature;

    let responseBlock = {
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
    console.log(responseBlock);
    const ret = await provider.request('ledger_sendRawTransaction', responseBlock)
}

async function requestBlock(accountAddress, publicKey, toAddress, amount, tokenId, fee, note) {
  let data = null;
  if (note && note.length > 0) {
    data = Buffer.from(note, 'utf8').toString("base64");
  }
  return await signRequestBlockAndSend(accountAddress, publicKey, toAddress, amount, tokenId, fee, data);
}

async function getOnlineAllBuiltinTokenInfo() {
  const onlineProvider = new ViteAPI(new HTTP_RPC('https://api.vitewallet.com/ios'), () => {
   console.log('Online Connetct');
  });

  let tokenInfos = [];
  let offset = 0;
  const count = 100;
  let hasMore = true;

  while (hasMore) {
    const result = await onlineProvider.request('mintage_getTokenInfoList', offset, count);
    tokenInfos = tokenInfos.concat(result.tokenInfoList);
    hasMore = (result.tokenInfoList.length == count);
    offset++;
  }
  
  return tokenInfos;
}

// test("vite.generateOnlineAllBuiltinTokenInfo", async () => {

//   const tokenInfos = await getOnlineAllBuiltinTokenInfo();
//   console.log("count" ,tokenInfos.length)

//   let text = "";
//   for (let index = 0; index < tokenInfos.length; index++) {
//     const token = tokenInfos[index];

//     let buffer = Buffer.from(AccountBlock.utils.getTokenIdHex(token.tokenId), "hex");
//     let raw = `{`;
    
//     raw += `0x${buffer.slice(0,1).toString("hex")},`;
//     raw += `0x${buffer.slice(1,2).toString("hex")},`;
//     raw += `0x${buffer.slice(2,3).toString("hex")},`;
//     raw += `0x${buffer.slice(3,4).toString("hex")},`;
//     raw += `0x${buffer.slice(4,5).toString("hex")},`;
//     raw += `0x${buffer.slice(5,6).toString("hex")},`;
//     raw += `0x${buffer.slice(6,7).toString("hex")},`;
//     raw += `0x${buffer.slice(7,8).toString("hex")},`;
//     raw += `0x${buffer.slice(8,9).toString("hex")},`;
//     raw += `0x${buffer.slice(9,10).toString("hex")}}`;

//     text += "{";
//     text += raw;
//     text += ", ";
//     text += '"';
//     text += token.tokenSymbol
//     if (token.tokenSymbol != 'VITE' && token.tokenSymbol != 'VCP' && token.tokenSymbol != 'VX') {
//       text += "-";
//       text += `${token.index}`.padStart(3, '0');
//     }
//     text += '"';
//     text += ", ";
//     text += `${token.decimals}`;
//     text += "},\n";
//   }
//   console.log(text);
// }, 50000000);

// test("vite.getAppConfig", async () => {
//   const result = await vite.getAppConfig();
//   console.log('version', result.version);
//   console.log('builtinTokenCount', result.builtinTokenCount);

//   let text = "";
//   for (let index = 0; index < result.builtinTokenCount; index++) {
//     const result = await vite.getBuiltinTokenInfo(index);
//     text += `${result.tokenId}, ${result.symbolAndIndex}, ${result.decimals}\n`;
//   }
//   console.log(`tokenInfo\n${text}`);

//   const amountText = await vite.getTestAmountText('1234567890123456789', 'tti_5649544520544f4b454e6e40');
//   console.log(`amountText: ${amountText}`);
// }, 50000000);

// test("vite.getTestAmountText", async () => {

//   function getAmount(count) {
//     if (count == 0) {
//       return '0';
//     }

//     const text = '1234567890';
//     let amount = '';
//     for (let index = 0; index < count; index++) {
//       amount += text[index%10];
//     }

//     return amount;
//   }

//   function amountToBaseString(amount, decimals) {
//     const min = new BigNumber(10).exponentiatedBy(decimals);
//     amount = new BigNumber(amount);
//     if (amount.c === null) {
//         return '';
//     }
//     try {
//         return amount.dividedBy(min).toFormat();
//     } catch (err) {
//         return '';
//     }
//   }

//   function uniqueSymbol(token) {
//     if (token.tokenSymbol == 'VITE' || token.tokenSymbol == 'VCP' || token.tokenSymbol == 'VX') {
//       return token.tokenSymbol;
//     } else {
//       return `${token.tokenSymbol}-`+`${token.index}`.padStart(3, '0');
//     }
//   }

//   const tokenInfos = await getOnlineAllBuiltinTokenInfo();
  
//   let maxDecimals = 0;
//   for (let index = 0; index < tokenInfos.length; index++) {
//     const tokenInfo = tokenInfos[index];
//     if (tokenInfo.decimals > maxDecimals) {
//       maxDecimals = tokenInfo.decimals;
//     }
//   }

//   BigNumber.config({ DECIMAL_PLACES: maxDecimals, FORMAT: {groupSeparator: '', decimalSeparator: '.'} })

//   console.log("maxDecimals" , maxDecimals);

//   for (let index = 0; index < tokenInfos.length; index++) {
//     const tokenInfo = tokenInfos[index];
//     console.log(`test ${uniqueSymbol(tokenInfo)} ${tokenInfo.decimals}`);
//     for (let index = 0; index < maxDecimals * 2; index++) {
//       const amount = getAmount(index);

//       const result = uniqueSymbol(tokenInfo) + ' ' + amountToBaseString(amount, tokenInfo.decimals)
//       const test = await vite.getTestAmountText(amount, tokenInfo.tokenId);
//       // console.log('amount', amount, 'result', result, 'test', test);
//       expect(result).toEqual(test);
//     }
//   }
// }, 50000000);

let accountIndex = 0;

// test("vite.getAddress", async () => {
//   await getAddress(accountIndex, false);
//   await getAddress(accountIndex, true);
// }, 50000000);

// test("vite.signResponseAccountBlock", async () => {
//   const accountResult = await vite.getAddress(accountIndex, false);
//   console.log(accountResult.publicKey);
//   console.log(accountResult.address);

//   const signResult = await vite.signResponseAccountBlock(0, 1, "1e3004d74382a8635b836eb8a3e34ede7c00a7a1bff0c150974c1235287ad07a", null, "4KVvCafscbA=");
//   console.log(signResult.blockHash);
//   console.log(signResult.signature);

// }, 50000000);

test("vite.signRequestAccountBlock", async () => {
  const accountResult = await vite.getAddress(accountIndex, false);
  console.log(accountResult.publicKey);
  console.log(accountResult.address);

  // let amount = "953456789012345678000000000000000000788728121291192";
  let amount = "9534567890123453000000000000000000";
  var tokenId =  "tti_5649544520544f4b454e6e40"; // vite
  // tokenId = "tti_5649544520544f4b454f315f"
  const xx = await vite.getTestAmountText(amount, tokenId);
  console.log(`resutl:${xx}`);

  const signResult = await vite.signRequestAccountBlock(0,2,"vite_0000000000000000000000000000000000000008e745d12403",
  amount,
  tokenId,
  null,null,"0dc5bfb1f3fdba8cc339b506de2e987bb1744e41332140d6a1a69c4b41e79595",null)

  console.log(signResult.blockHash);
  console.log(signResult.signature);

}, 50000000);

// test("vite.signRequestAccountBlock", async () => {
//   try {
//     const _accountResult = await getAddress(accountIndex, false);
//     let publicKey = _accountResult.publicKey;
//     let accountAddress = _accountResult.address;

//     const toAddress = "vite_847e1672c9a775ca0f3c3a2d3bf389ca466e5501cbecdb7107";
//     const tokenId = "tti_5649544520544f4b454e6e40";
//     const fee = "0";

//     const notes = [
//       null,
//       // "",
//       // "abcdefghijklmnopqrstuvwxyz",
//       // "abcdefghijklmnopqrstuvwxyz_ABCDEFGHIJKLMNOPQRSTUVWXYZ-0123456789",
//       // "abcdefghijklmnopqrstuvwxyz_ABCDEFGHIJKLMNOPQRSTUVWXYZ-0123456789-haha",
//       // "交易所ViteX在4月16日正式上线公测版本。ViteX作为完全去中心化交易所具有链上撮合交易;、链上分红、交易信息链上完全透明、 私钥资产由用户自己保管、交易即挖矿、任何人都可以在ViteX交易所自主上币等特点。ViteX交易所公测地址： https://x-test.vite.net/为了方便您数字资产的保管，在体验交易所公测版本时，需要您重新注册账号，领取测试代币后即可体验交易（钱包的测试代币需要在交易所“资产管理”内充币至交易所）。在公测版本中我们将会开启以下14个交易对：GRIN.T/BTC、ETH/BTC、VITE/BTC、VTT.T/BTC、VTT.T/ETH、VITE/ETH、GRIN.T/ETH、GRIN.T/VITE、VTT.T/VITE、BTC/USDT、ETH/USDT、VITE/USDT、GRIN.T/USDT、VTT.T/USDT。最小交易额分别为：100VITE、0.01ETH，0.0005BTC，1USDT。公测版ViteX交易所仅有Web版本，下面为公测版本截图。",
//       // "全球第一个基于DAG的去中心化交易所ViteX在4月16日正式上线公测版本。ViteX作为完全去中心化交易所具有链上撮合交易;、链上分红、交易信息链上完全透明、 私钥资产由用户自己保管、交易即挖矿、任何人都可以在ViteX交易所自主上币等特点。ViteX交易所公测地址： https://x-test.vite.net/为了方便您数字资产的保管，在体验交易所公测版本时，需要您重新注册账号，领取测试代币后即可体验交易（钱包的测试代币需要在交易所“资产管理”内充币至交易所）。在公测版本中我们将会开启以下14个交易对：GRIN.T/BTC、ETH/BTC、VITE/BTC、VTT.T/BTC、VTT.T/ETH、VITE/ETH、GRIN.T/ETH、GRIN.T/VITE、VTT.T/VITE、BTC/USDT、ETH/USDT、VITE/USDT、GRIN.T/USDT、VTT.T/USDT。最小交易额分别为：100VITE、0.01ETH，0.0005BTC，1USDT。公测版ViteX交易所仅有Web版本，下面为公测版本截图。"
//     ];

//     for (let index = 0; index < notes.length; index++) {
//       // let amount = `${index}000000000000000000`;
//       let amount = `1000000000000000000`;
//       const note = notes[index];

//       let dataLength = null;
//       if (note) {
//         dataLength = Buffer.from(note, 'utf8').length
//       }
//       console.log('amount:', index, 'dataLength:', dataLength, 'note:', note);

//       await requestBlock(
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

// test("vite.signLatestReceiveAccountBlock", async () => {

//   try {
//     const _accountResult = await getAddress(accountIndex, false);
//     let publicKey = _accountResult.publicKey;
//     let accountAddress = _accountResult.address;

//     await signRequestBlockAndSend(accountAddress, publicKey, accountAddress, "1000000000000000000", "tti_5649544520544f4b454e6e40", "0", null);

//     while (true) {
//       const unreceivedBlock = await getFirstUnreceivedBlock(accountAddress);
//       if (unreceivedBlock == null) {
//         console.log('No unreceivedBlocks');
//         return;
//       }

//       const sendBlockHash = unreceivedBlock.hash;
//       await signResponseBlockAndSend(accountAddress, publicKey, sendBlockHash);
//     }

//   } catch(err) {
//     console.warn(err);
//   }

// }, 50000000);