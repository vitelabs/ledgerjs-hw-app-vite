const { 
  default: Transport 
} = require("@ledgerhq/hw-transport-node-hid");
const {
  default: AppBtc
} = require("..");

test("btc.getWalletPublicKey", async () => {
  const getBtcAddress = async () => {
    const transport = await Transport.create();
    const btc = new AppBtc(transport);
    const result = await btc.getWalletPublicKey("44'/0'/0'/0/0");
    return result.bitcoinAddress;
  };
  const address = await getBtcAddress();
  console.log(address);
});

// test("btc.getWalletPublicKey", async () => {
//   const Transport = createTransportReplayer(
//     RecordStore.fromString(`
//       => e040000011048000002c800000008000000000000000
//       <= 410486b865b52b753d0a84d09bc20063fab5d8453ec33c215d4019a5801c9c6438b917770b2782e29a9ecc6edb67cd1f0fbf05ec4c1236884b6d686d6be3b1588abb2231334b453654666641724c683466564d36756f517a7673597135767765744a63564dbce80dd580792cd18af542790e56aa813178dc28644bb5f03dbd44c85f2d2e7a9000
//     `)
//   );
//   const transport = await Transport.open();
//   const btc = new Btc(transport);
//   const result = await btc.getWalletPublicKey("44'/0'/0'/0");
//   expect(result).toEqual({
//     bitcoinAddress: "13KE6TffArLh4fVM6uoQzvsYq5vwetJcVM",
//     chainCode: "bce80dd580792cd18af542790e56aa813178dc28644bb5f03dbd44c85f2d2e7a",
//     publicKey: "0486b865b52b753d0a84d09bc20063fab5d8453ec33c215d4019a5801c9c6438b917770b2782e29a9ecc6edb67cd1f0fbf05ec4c1236884b6d686d6be3b1588abb"
//   });
// });

// test("btc 2", async () => {
//   const Transport = createTransportReplayer(
//     RecordStore.fromString(`
//     => e042000009000000010100000001
//     <= 9000
//     => e0428000254ea60aeac5252c14291d428915bd7ccd1bfc4af009f4d4dc57ae597ed0420b71010000008a
//     <= 9000
//     => e04280003247304402201f36a12c240dbf9e566bc04321050b1984cd6eaf6caee8f02bb0bfec08e3354b022012ee2aeadcbbfd1e92959f
//     <= 9000
//     => e04280003257c15c1c6debb757b798451b104665aa3010569b49014104090b15bde569386734abf2a2b99f9ca6a50656627e77de663ca7
//     <= 9000
//     => e04280002a325702769986cf26cc9dd7fdea0af432c8e2becc867c932e1b9dd742f2a108997c2252e2bdebffffffff
//     <= 9000
//     => e04280000102
//     <= 9000
//     => e04280002281b72e00000000001976a91472a5d75c8d2d0565b656a5232703b167d50d5a2b88ac
//     <= 9000
//     => e042800022a0860100000000001976a9144533f5fb9b4817f713c48f0bfe96b9f50c476c9b88ac
//     <= 9000
//     => e04280000400000000
//     <= 32005df4c773da236484dae8f0fdba3d7e0ba1d05070d1a34fc44943e638441262a04f1001000000a086010000000000b890da969aa6f3109000
//     => e04000000d03800000000000000000000000
//     <= 41046666422d00f1b308fc7527198749f06fedb028b979c09f60d0348ef79c985e4138b86996b354774c434488d61c7fb20a83293ef3195d422fde9354e6cf2a74ce223137383731457244716465764c544c57424836577a6a556331454b4744517a434d41612d17bc55b7aa153ae07fba348692c2976e6889b769783d475ba7488fb547709000
//     => e0440000050100000001
//     <= 9000
//     => e04480003b013832005df4c773da236484dae8f0fdba3d7e0ba1d05070d1a34fc44943e638441262a04f1001000000a086010000000000b890da969aa6f31019
//     <= 9000
//     => e04480001d76a9144533f5fb9b4817f713c48f0bfe96b9f50c476c9b88acffffffff
//     <= 9000
//     => e04a80002301905f0100000000001976a91472a5d75c8d2d0565b656a5232703b167d50d5a2b88ac
//     <= 00009000
//     => e04800001303800000000000000000000000000000000001
//     <= 3145022100ff492ad0b3a634aa7751761f7e063bf6ef4148cd44ef8930164580d5ba93a17802206fac94b32e296549e2e478ce806b58d61cfacbfed35ac4ceca26ac531f92b20a019000    
//     `)
//   );
//   const transport = await Transport.open();
//   const btc = new Btc(transport);
//   var tx1 = btc.splitTransaction(
//     "01000000014ea60aeac5252c14291d428915bd7ccd1bfc4af009f4d4dc57ae597ed0420b71010000008a47304402201f36a12c240dbf9e566bc04321050b1984cd6eaf6caee8f02bb0bfec08e3354b022012ee2aeadcbbfd1e92959f57c15c1c6debb757b798451b104665aa3010569b49014104090b15bde569386734abf2a2b99f9ca6a50656627e77de663ca7325702769986cf26cc9dd7fdea0af432c8e2becc867c932e1b9dd742f2a108997c2252e2bdebffffffff0281b72e00000000001976a91472a5d75c8d2d0565b656a5232703b167d50d5a2b88aca0860100000000001976a9144533f5fb9b4817f713c48f0bfe96b9f50c476c9b88ac00000000"
//   );
//   const result = await btc.createPaymentTransactionNew(
//     [
//       [tx1, 1]
//     ],
//     ["0'/0/0"],
//     undefined,
//     "01905f0100000000001976a91472a5d75c8d2d0565b656a5232703b167d50d5a2b88ac"
//   );
//   expect(result).toEqual(
//     "0100000001c773da236484dae8f0fdba3d7e0ba1d05070d1a34fc44943e638441262a04f10010000006b483045022100ff492ad0b3a634aa7751761f7e063bf6ef4148cd44ef8930164580d5ba93a17802206fac94b32e296549e2e478ce806b58d61cfacbfed35ac4ceca26ac531f92b20a0121026666422d00f1b308fc7527198749f06fedb028b979c09f60d0348ef79c985e41ffffffff01905f0100000000001976a91472a5d75c8d2d0565b656a5232703b167d50d5a2b88ac00000000"
//   );
// });

// test("btc 3", async () => {
//   const Transport = createTransportReplayer(
//     RecordStore.fromString(`
//     => e042000009000000010100000001
//     <= 9000
//     => e0428000254ea60aeac5252c14291d428915bd7ccd1bfc4af009f4d4dc57ae597ed0420b71010000008a
//     <= 9000
//     => e04280003247304402201f36a12c240dbf9e566bc04321050b1984cd6eaf6caee8f02bb0bfec08e3354b022012ee2aeadcbbfd1e92959f
//     <= 9000
//     => e04280003257c15c1c6debb757b798451b104665aa3010569b49014104090b15bde569386734abf2a2b99f9ca6a50656627e77de663ca7
//     <= 9000
//     => e04280002a325702769986cf26cc9dd7fdea0af432c8e2becc867c932e1b9dd742f2a108997c2252e2bdebffffffff
//     <= 9000
//     => e04280000102
//     <= 9000
//     => e04280002281b72e00000000001976a91472a5d75c8d2d0565b656a5232703b167d50d5a2b88ac
//     <= 9000
//     => e042800022a0860100000000001976a9144533f5fb9b4817f713c48f0bfe96b9f50c476c9b88ac
//     <= 9000
//     => e04280000400000000
//     <= 3200e4eac773da236484dae8f0fdba3d7e0ba1d05070d1a34fc44943e638441262a04f1001000000a086010000000000c79483cc9a6e96fe9000
//     => e0440000050100000001
//     <= 9000
//     => e04480002600c773da236484dae8f0fdba3d7e0ba1d05070d1a34fc44943e638441262a04f100100000069
//     <= 9000
//     => e04480003252210289b4a3ad52a919abd2bdd6920d8a6879b1e788c38aa76f0440a6f32a9f1996d02103a3393b1439d1693b063482c04b
//     <= 9000
//     => e044800032d40142db97bdf139eedd1b51ffb7070a37eac321030b9a409a1e476b0d5d17b804fcdb81cf30f9b99c6f3ae1178206e08bc5
//     <= 9000
//     => e04480000900639853aeffffffff
//     <= 9000
//     => e04a80002301905f0100000000001976a91472a5d75c8d2d0565b656a5232703b167d50d5a2b88ac
//     <= 00009000
//     => e04800001303800000000000000000000000000000000001
//     <= 3045022100b5b1813992282b9a1fdd957b9751d79dc21018abc6586336e272212cc89cfe84022053765a1da0bdb5a0631a9866f1fd4c583589d5188b11cfa302fc20cd2611a71e019000    
//     `)
//   );
//   const transport = await Transport.open();
//   const btc = new Btc(transport);
//   var tx1 = btc.splitTransaction(
//     "01000000014ea60aeac5252c14291d428915bd7ccd1bfc4af009f4d4dc57ae597ed0420b71010000008a47304402201f36a12c240dbf9e566bc04321050b1984cd6eaf6caee8f02bb0bfec08e3354b022012ee2aeadcbbfd1e92959f57c15c1c6debb757b798451b104665aa3010569b49014104090b15bde569386734abf2a2b99f9ca6a50656627e77de663ca7325702769986cf26cc9dd7fdea0af432c8e2becc867c932e1b9dd742f2a108997c2252e2bdebffffffff0281b72e00000000001976a91472a5d75c8d2d0565b656a5232703b167d50d5a2b88aca0860100000000001976a9144533f5fb9b4817f713c48f0bfe96b9f50c476c9b88ac00000000"
//   );
//   const result = await btc.signP2SHTransaction(
//     [
//       [
//         tx1,
//         1,
//         "52210289b4a3ad52a919abd2bdd6920d8a6879b1e788c38aa76f0440a6f32a9f1996d02103a3393b1439d1693b063482c04bd40142db97bdf139eedd1b51ffb7070a37eac321030b9a409a1e476b0d5d17b804fcdb81cf30f9b99c6f3ae1178206e08bc500639853ae"
//       ]
//     ],
//     ["0'/0/0"],
//     "01905f0100000000001976a91472a5d75c8d2d0565b656a5232703b167d50d5a2b88ac"
//   );

//   expect(result).toEqual([
//     "3045022100b5b1813992282b9a1fdd957b9751d79dc21018abc6586336e272212cc89cfe84022053765a1da0bdb5a0631a9866f1fd4c583589d5188b11cfa302fc20cd2611a71e"
//   ]);
// });

// test("btc 4", async () => {
//   const Transport = createTransportReplayer(
//     RecordStore.fromString(`
//     => e04e000117048000002c800000008000000000000000000474657374
//     <= 00009000
//     => e04e80000100
//     <= 3045022100e32b32b8a6b4228155ba4d1a536d8fed9900606663fbbf4ea420ed8e944f9c18022053c97c74d2f6d8620d060584dc7886f5f3003684bb249508eb7066215172281a9000
//     `)
//   );
//   const transport = await Transport.open();

//   const btc = new Btc(transport);
//   const result = await btc.signMessageNew(
//     "44'/0'/0'/0",
//     Buffer.from("test").toString("hex")
//   );

//   expect(result).toEqual({
//     r: "e32b32b8a6b4228155ba4d1a536d8fed9900606663fbbf4ea420ed8e944f9c18",
//     s: "53c97c74d2f6d8620d060584dc7886f5f3003684bb249508eb7066215172281a",
//     v: 0
//   });
// });

// test("btc seg multi", async () => {
//   const Transport = createTransportReplayer(
//     RecordStore.fromString(`
//     => e040000015058000003180000001800000050000000000000000
//     <= 4104f004370a593b3cde1511801a1151c86dd09a2f246a3f9ac3ef0b0240c0aeb506feddb0a785f5039c3e3e829db9692364e333256284d0fe312177cb12b88551162131764a4336523431416334685a61704a7863334c5a6e69334e7169445837514562141c248b44b74cbe35a3a92801cfebaf895df8d65f5830264097260c863fc1e59000
//     => e040000015058000003180000001800000050000000000000000
//     <= 4104f004370a593b3cde1511801a1151c86dd09a2f246a3f9ac3ef0b0240c0aeb506feddb0a785f5039c3e3e829db9692364e333256284d0fe312177cb12b88551162131764a4336523431416334685a61704a7863334c5a6e69334e7169445837514562141c248b44b74cbe35a3a92801cfebaf895df8d65f5830264097260c863fc1e59000
//     => e0440002050100000002
//     <= 9000
//     => e04480022e02f5f6920fea15dda9c093b565cecbe8ba50160071d9bc8bc3474e09ab25a3367d00000000c03b47030000000000
//     <= 9000
//     => e044800204ffffffff
//     <= 9000
//     => e04480022e023b9b487a91eee1293090cc9aba5acdde99e562e55b135609a766ffec4dd1100a0000000080778e060000000000
//     <= 9000
//     => e044800204ffffffff
//     <= 9000
//     => e04a80002101ecd3e7020000000017a9142397c9bb7a3b8a08368a72b3e58c7bb85055579287
//     <= 00009000
//     => e0440080050100000001
//     <= 9000
//     => e04480802e02f5f6920fea15dda9c093b565cecbe8ba50160071d9bc8bc3474e09ab25a3367d00000000c03b47030000000019
//     <= 9000
//     => e04480801d76a9140a146582553b2f5537e13cef6659e82ed8f69b8f88acffffffff
//     <= 9000
//     => e04800001b058000003180000001800000050000000000000000000000000001
//     <= 30440220081d5f82ec23759eaf93519819faa1037faabdc27277c8594f5e8e2ba04cb24502206dfff160629ef1fbae78c74d59bfa8c7d59f873c905b196cf2e3efa2273db988019000
//     => e0440080050100000001
//     <= 9000
//     => e04480802e023b9b487a91eee1293090cc9aba5acdde99e562e55b135609a766ffec4dd1100a0000000080778e060000000019
//     <= 9000
//     => e04480801d76a9140a146582553b2f5537e13cef6659e82ed8f69b8f88acffffffff
//     <= 9000
//     => e04800001b058000003180000001800000050000000000000000000000000001
//     <= 3145022100c820c90ce84c6567617733cd6409c4b8f7469b863d811a3cdc73bf3fa43912bc0220320b7fd259939a6821d371f2b49a755d1ca588bffb1476fbb2da68907427b54b019000    
//     `)
//   );
//   const transport = await Transport.open();

//   const btc = new Btc(transport);
//   var tx1 = btc.splitTransaction(
//     "0100000000010130992c1559a43de1457f23380fefada09124d22594bbeb46ab6e9356e8407d39010000001716001417507f91a6594df7367a0561e4d3df376a829e1fffffffff02c03b47030000000017a9142397c9bb7a3b8a08368a72b3e58c7bb850555792875f810acf0900000017a914813a2e6c7538f0d0afbdeb5db38608804f5d76ab8702483045022100e09ca8a5357623438daee5b7804e73c9209de7c645efd405f13f83420157c48402207d3e4a30f362e062e361967c7afdd45e7f21878a067b661a6635669e620f99910121035606550fd51f6b063b69dc92bd182934a34463f773222743f300d3c7fd3ae47300000000",
//     true
//   );
//   var tx2 = btc.splitTransaction(
//     "0100000000010176ef6abce7feecefbe1322da6cd21245f2d475a1836f13e99f56847bf7127f7c0100000017160014a4e29e297768fccd19cabc21cced93a6afc803eeffffffff0280778e060000000017a9142397c9bb7a3b8a08368a72b3e58c7bb8505557928795061b51b100000017a914c5cfa33e119f60c7cb40bd6b9cfe9e78b026eb6a8702473044022031f0c72683374275328ef0341ed1f233c55a37e21335f9c111c25645b50d0d4e0220670b833be0f688c237bf4466d2b94c99631ada3557c95a7d13bfbb9177125c340121020879f8616da54f8ac5476b97fbe0329c5a0e4cbd32e22e7348262bdfad99a44200000000",
//     true
//   );
//   const result = await btc.createPaymentTransactionNew(
//     [
//       [tx1, 0],
//       [tx2, 0]
//     ],
//     ["49'/1'/5'/0/0", "49'/1'/5'/0/0"],
//     undefined,
//     "01ecd3e7020000000017a9142397c9bb7a3b8a08368a72b3e58c7bb85055579287",
//     undefined,
//     undefined,
//     true
//   );

//   expect(result).toEqual(
//     "01000000000102f5f6920fea15dda9c093b565cecbe8ba50160071d9bc8bc3474e09ab25a3367d00000000171600140a146582553b2f5537e13cef6659e82ed8f69b8fffffffff3b9b487a91eee1293090cc9aba5acdde99e562e55b135609a766ffec4dd1100a00000000171600140a146582553b2f5537e13cef6659e82ed8f69b8fffffffff01ecd3e7020000000017a9142397c9bb7a3b8a08368a72b3e58c7bb85055579287024730440220081d5f82ec23759eaf93519819faa1037faabdc27277c8594f5e8e2ba04cb24502206dfff160629ef1fbae78c74d59bfa8c7d59f873c905b196cf2e3efa2273db988012102f004370a593b3cde1511801a1151c86dd09a2f246a3f9ac3ef0b0240c0aeb50602483045022100c820c90ce84c6567617733cd6409c4b8f7469b863d811a3cdc73bf3fa43912bc0220320b7fd259939a6821d371f2b49a755d1ca588bffb1476fbb2da68907427b54b012102f004370a593b3cde1511801a1151c86dd09a2f246a3f9ac3ef0b0240c0aeb50600000000"
//   );
// });

// test("btc sign p2sh seg", async () => {
//   const Transport = createTransportReplayer(
//     RecordStore.fromString(`
//     => e0440002050100000001
//     <= 9000
//     => e04480022e021ba3852a59cded8d2760434fa75af58a617b21e4fbe1cf9c826ea2f14f80927d00000000102700000000000000
//     <= 9000
//     => e044800204ffffffff
//     <= 9000
//     => e04a8000230188130000000000001976a9140ae1441568d0d293764a347b191025c51556cecd88ac
//     <= 00009000
//     => e0440080050100000001
//     <= 9000
//     => e04480802e021ba3852a59cded8d2760434fa75af58a617b21e4fbe1cf9c826ea2f14f80927d00000000102700000000000047
//     <= 9000
//     => e0448080325121026666422d00f1b308fc7527198749f06fedb028b979c09f60d0348ef79c985e41210384257cf895f1ca492bbee5d748
//     <= 9000
//     => e0448080195ae0ef479036fdf59e15b92e37970a98d6fe7552aeffffffff
//     <= 9000
//     => e04800001303800000000000000000000000000000000001
//     <= 3045022100932934ee326c19c81b72fb03cec0fb79ff980a8076639f77c7edec35bd59da1e02205e4030e8e0fd2405f6db2fe044c49d3f191adbdc0e05ec7ed4dcc4c6fe7310e5019000    
//     `)
//   );
//   const transport = await Transport.open();

//   const btc = new Btc(transport);

//   var tx1 = btc.splitTransaction(
//     "0100000001d3a05cd6e15582f40e68bb8b1559dc9e5b3e4f9f34d92c1217dc8c3355bc844e010000008a47304402207ab1a4768cbb036d4bce3c4a294c13cc5ae6076fc7bedce88c62aa80ae366da702204f8fea6923f8df36315c0c26cb42d8d7ab52ca4736776816e10d6ce51906d0600141044289801366bcee6172b771cf5a7f13aaecd237a0b9a1ff9d769cabc2e6b70a34cec320a0565fb7caf11b1ca2f445f9b7b012dda5718b3cface369ee3a034ded6ffffffff02102700000000000017a9141188cc3c265fbc01a025fc8adec9823effd0cef187185f9265170100001976a9140ae1441568d0d293764a347b191025c51556cecd88ac00000000",
//     true
//   );

//   const result = await btc.signP2SHTransaction(
//     [
//       [
//         tx1,
//         0,
//         "5121026666422d00f1b308fc7527198749f06fedb028b979c09f60d0348ef79c985e41210384257cf895f1ca492bbee5d7485ae0ef479036fdf59e15b92e37970a98d6fe7552ae"
//       ]
//     ],
//     ["0'/0/0"],
//     "0188130000000000001976a9140ae1441568d0d293764a347b191025c51556cecd88ac",
//     undefined,
//     undefined,
//     true
//   );

//   expect(result).toEqual([
//     "3045022100932934ee326c19c81b72fb03cec0fb79ff980a8076639f77c7edec35bd59da1e02205e4030e8e0fd2405f6db2fe044c49d3f191adbdc0e05ec7ed4dcc4c6fe7310e501"
//   ]);
// });

// test("signMessage", async () => {
//   const Transport = createTransportReplayer(
//     RecordStore.fromString(`
//     => e04e00011d058000002c800000008000000000000000000000000006666f6f626172
//     <= 00009000
//     => e04e80000100
//     <= 314402205eac720be544d3959a760d9bfd6a0e7c86d128fd1030038f06d85822608804e20220385d83273c9d03c469596292fb354b07d193034f83c2633a4c1f057838e12a5b9000
//     `)
//   );

//   const transport = await Transport.open();

//   const btc = new Btc(transport);

//   const res = await btc.signMessageNew(
//     "44'/0'/0'/0/0",
//     Buffer.from("foobar").toString("hex")
//   );

//   expect(res).toEqual({
//     v: 1,
//     r: "5eac720be544d3959a760d9bfd6a0e7c86d128fd1030038f06d85822608804e2",
//     s: "385d83273c9d03c469596292fb354b07d193034f83c2633a4c1f057838e12a5b"
//   });
// });