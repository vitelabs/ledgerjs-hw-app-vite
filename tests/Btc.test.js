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
});