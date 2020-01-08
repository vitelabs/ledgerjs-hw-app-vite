const { 
  default: Transport 
} = require("@ledgerhq/hw-transport-node-hid");
const {
  default: Nano
} = require("../lib/Nano");
const {
  default: Vite
} = require("../lib/Vite");



// test("vite.getAddress", async () => {
//   let accountIndex = 0
//   const transport = await Transport.create();
//   const vite = new Vite(transport);
//   const result = await vite.getAddress(accountIndex, false);
//   console.log(result.publicKey);
//   console.log(result.address);

// });

test("vite.signReceiveAccountBlock", async () => {

  let accountIndex = 0
  const transport = await Transport.create();
  const vite = new Vite(transport);
  const accountResult = await vite.getAddress(accountIndex, false);
  console.log(accountResult.publicKey);
  console.log(accountResult.address);

  const signResult = await vite.signReceiveAccountBlock(0, null, 1, "1e3004d74382a8635b836eb8a3e34ede7c00a7a1bff0c150974c1235287ad07a", "4KVvCafscbA=");
  console.log(signResult.blockHash);
  console.log(signResult.signature);

});


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