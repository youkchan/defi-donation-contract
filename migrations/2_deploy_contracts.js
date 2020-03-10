const DeFiDonation = artifacts.require("DeFiDonation");
const DonationAccountFactory = artifacts.require("DonationAccountFactory");

const dev_usdc = "0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b";
const dev_cusdc = "0x5b281a6dda0b271e91ae35de655ad301c976edb1";

module.exports = (deployer) => {

  deployer.then(async() => {
    return await deployer.deploy(DonationAccountFactory);
  }).then(async (instance) => {
    await deployer.deploy(DeFiDonation, dev_usdc, dev_cusdc, instance.address);
  });

};

