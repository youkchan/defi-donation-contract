const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const DeFiDonation = artifacts.require("DeFiDonation");
const fs = require('fs');
const d_account_contract = JSON.parse(fs.readFileSync('./build/contracts/DonationAccount.json', 'utf8'));
const usdc_contract = JSON.parse(fs.readFileSync('./centre-tokens/build/contracts/FiatTokenV1.json', 'utf8'));
const d_account_abi = d_account_contract.abi;
const usdc_abi = usdc_contract.abi;

const dev_usdc = "0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b";
const dev_cusdc = "0x5b281a6dda0b271e91ae35de655ad301c976edb1";
let accounts;

contract("DeFiDonation", function() {

  before(async () => {
    accounts = await web3.eth.getAccounts();
	console.log(accounts);
	console.log(accounts[0]);
  });

  it("should assert true", async function() {
    const defi = await DeFiDonation.deployed();
    assert.isTrue(true);
  });

  it("isAccountExists false", async function() {
    const defi = await DeFiDonation.deployed();
    const isAccountExists = await defi.isAccountExists.call({from: accounts[0]});
    assert.equal(isAccountExists, false);
  });

  it("createDonationAccount", async function() {
    const defi = await DeFiDonation.deployed();
    await defi.createDonationAccount({from: accounts[0]});
    const isAccountExists = await defi.isAccountExists.call({from: accounts[0]});
    assert.equal(isAccountExists, true);
  });

  it("getDonationAccount error", async function() {
    const defi = await DeFiDonation.deployed();
	chai.expect(defi.getDonationAccount.call({from: accounts[1]})).to.be.rejectedWith()
  });

  it("getDonationAccount", async function() {
    const defi = await DeFiDonation.deployed();
    const account = await defi.getDonationAccount.call({from: accounts[0]});
    assert.notEqual(0x0000000000000000000000000000000000000000, account);
  });

  it("donationAccount getUnderlyingBalance balance 0", async function() {
    const defi = await DeFiDonation.deployed();
    const account = await defi.getDonationAccount.call({from: accounts[0]});
    const d_account = await new web3.eth.Contract(d_account_abi, account );
	const balance = await d_account.methods.getUnderlyingBalance().call({from: accounts[0]});
	assert.equal(balance, 0);
  });

  it("getUnderlyingBalance error", async function() {
    const defi = await DeFiDonation.deployed();
    const account = await defi.getDonationAccount.call({from: accounts[0]});
    const d_account = await new web3.eth.Contract(d_account_abi, account );
	chai.expect(d_account.methods.getUnderlyingBalance().call({from: accounts[1]})).to.be.rejectedWith();
  });

  it("deposit error", async function() {
    const defi = await DeFiDonation.deployed();
    const account = await defi.getDonationAccount.call({from: accounts[0]});
    const d_account = await new web3.eth.Contract(d_account_abi, account );
    const usdc = await new web3.eth.Contract(usdc_abi, dev_usdc);
	chai.expect(d_account.methods._deposit(100).send({from:accounts[0], gas: 700000, gasPrice: 10000000000})).to.be.rejectedWith();
 });


  it("deposit", async function() {
    const defi = await DeFiDonation.deployed();
    const account = await defi.getDonationAccount.call({from: accounts[0]});
    const d_account = await new web3.eth.Contract(d_account_abi, account );
    const usdc = await new web3.eth.Contract(usdc_abi, dev_usdc);
	
    let response = await usdc.methods.allowance(accounts[0], account).call();
	assert.equal(response, 0);
    await usdc.methods.approve(account, 100).send({from:accounts[0], gas: 500000, gasPrice: 10000000000});
    response = await usdc.methods.allowance(accounts[0], account).call();
	assert.equal(response, 100);
	await d_account.methods._deposit(100).send({from:accounts[0], gas: 700000, gasPrice: 10000000000});
    response = await usdc.methods.allowance(accounts[0], account).call();
	assert.equal(response, 0);
    response = await usdc.methods.balanceOf(account).call();
	assert.equal(response, 100);
 });

  it("supply", async function() {
    const defi = await DeFiDonation.deployed();
    const account = await defi.getDonationAccount.call({from: accounts[0]});
    const d_account = await new web3.eth.Contract(d_account_abi, account );
	let balance = await d_account.methods.getUnderlyingBalance().call({from: accounts[0]});
	assert.equal(balance, 0);
    const usdc = await new web3.eth.Contract(usdc_abi, dev_usdc);
    await usdc.methods.approve(account, 100).send({from:accounts[0], gas: 500000, gasPrice: 10000000000});
	await d_account.methods.supply(100).send({from:accounts[0], gas: 700000, gasPrice: 10000000000});
	balance = await d_account.methods.getUnderlyingBalance().call({from: accounts[0]});
	assert.equal(balance, 99);
 });

  it("addDonateProject", async function() {
    const defi = await DeFiDonation.deployed();
    const account = await defi.getDonationAccount.call({from: accounts[0]});
    const d_account = await new web3.eth.Contract(d_account_abi, account );
	let balance = await d_account.methods.getDonateAmount(accounts[1]).call({from: accounts[0]});
	assert.equal(balance, 0);
	await d_account.methods.addDonateProject(accounts[1], 100).send({from:accounts[0], gas: 700000, gasPrice: 10000000000});
	balance = await d_account.methods.getDonateAmount(accounts[1]).call({from: accounts[0]});
	assert.equal(balance, 100);
  });

  it("owner", async function() {
    const defi = await DeFiDonation.deployed();
    const account = await defi.getDonationAccount.call({from: accounts[0]});
    const d_account = await new web3.eth.Contract(d_account_abi, account );
	const owner = await d_account.methods.owner().call({from: accounts[0]});
	assert.equal(owner, accounts[0]);
  });

  it("redeem", async function() {
    const defi = await DeFiDonation.deployed();
    await defi.createDonationAccount({from: accounts[2]});
    const account = await defi.getDonationAccount.call({from: accounts[2]});
    const d_account = await new web3.eth.Contract(d_account_abi, account );
	let balance = await d_account.methods.getUnderlyingBalance().call({from: accounts[2]});
    const usdc = await new web3.eth.Contract(usdc_abi, dev_usdc);
    await usdc.methods.approve(account, 100).send({from:accounts[2], gas: 500000, gasPrice: 10000000000});
	await d_account.methods.supply(100).send({from:accounts[2], gas: 700000, gasPrice: 10000000000});
	balance = await d_account.methods.getUnderlyingBalance().call({from: accounts[2]});
	assert.equal(balance, 99);
    const balanceBefore = await usdc.methods.balanceOf(accounts[2]).call();
	await d_account.methods.redeem(balance).send({from:accounts[2], gas: 700000, gasPrice: 10000000000});
    const balanceAfter = await usdc.methods.balanceOf(accounts[2]).call();
	const expectedBalanceAfter = +balanceBefore + +balance;
	assert.equal(+balanceAfter, expectedBalanceAfter);
 });


  it("donate", async function() {
    const defi = await DeFiDonation.deployed();
    await defi.createDonationAccount({from: accounts[3]});
    const account = await defi.getDonationAccount.call({from: accounts[3]});
    const d_account = await new web3.eth.Contract(d_account_abi, account );
	let balance = await d_account.methods.getUnderlyingBalance().call({from: accounts[3]});
    const usdc = await new web3.eth.Contract(usdc_abi, dev_usdc);
    await usdc.methods.approve(account, 100).send({from:accounts[3], gas: 500000, gasPrice: 10000000000});
	await d_account.methods.supply(100).send({from:accounts[3], gas: 700000, gasPrice: 10000000000});
	balanceBefore = await d_account.methods.getUnderlyingBalance().call({from: accounts[3]});
	await d_account.methods.addDonateProject(accounts[1], 100).send({from:accounts[3], gas: 700000, gasPrice: 10000000000});
    const AcccountbalanceBefore = await usdc.methods.balanceOf(accounts[1]).call();
	await d_account.methods.donate(accounts[1]).send({from:accounts[3], gas: 700000, gasPrice: 10000000000});
	balanceAfter = await d_account.methods.getUnderlyingBalance().call({from: accounts[3]});
	assert.equal(+balanceAfter, 0);
    const AcccountbalanceAfter = await usdc.methods.balanceOf(accounts[1]).call();
	assert.equal(AcccountbalanceAfter, +AcccountbalanceBefore + 100);

 });

});
