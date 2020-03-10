const DonationAccountFactory = artifacts.require("DonationAccountFactory");
const dev_usdc = "0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b";
const dev_cusdc = "0x5b281a6dda0b271e91ae35de655ad301c976edb1";
let accounts;
let account2;
let account3;
let account4;

contract("DonationAccountFactory", function() {

  before(async () => {
    account2 = web3.eth.accounts.privateKeyToAccount('0x32c67b5062ffd242ec375bbd5391774ec00890c6d8ae0a405c90902c5486dc58');
    account3 = web3.eth.accounts.privateKeyToAccount('0x320a4e5e9603a232c6869d97c5183b833ab77ecc20e09b1e39fa3461e54026f5');
    account4 = web3.eth.accounts.privateKeyToAccount('0x7de6b85707077972a7343bdf92369c2371e9ff242b266ad5ba50f47346dd3e14');
    accounts = await web3.eth.getAccounts();
  });


  it("should assert true", async function() {
    await DonationAccountFactory.deployed();
    assert.isTrue(true);
  });

  it("createDonationAccount", async function() {
    const daf = await DonationAccountFactory.deployed();
    await daf.createInstance(dev_usdc, dev_cusdc, {from: accounts[0]});
	assert.ok();
   });

});
