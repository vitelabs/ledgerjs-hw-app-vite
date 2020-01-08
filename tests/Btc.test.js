const { 
  default: Transport 
} = require("@ledgerhq/hw-transport-node-hid");
const {
  default: Nano
} = require("../lib/Nano");
const {
  default: Vite
} = require("../lib/Vite");

test("vite.getWalletPublicKey", async () => {
  console.log(Nano);
  console.log(Vite);

  const getAddress = async () => {
    const transport = await Transport.create();
    const nano = new Nano(transport);
    const result = await nano.getAddress("44'/165'/0'", true);
    return result.address;
  };
  const address = await getAddress();
  console.log(address);


});