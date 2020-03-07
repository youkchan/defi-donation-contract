pragma solidity 0.5.16;
import "../centre-tokens/contracts/FiatTokenV1.sol";
import "../compound-protocol/contracts/CErc20.sol";
import "./DonationAccountFactory.sol";

contract DeFiDonation {
  FiatTokenV1 private usdc;
  CErc20 private cusdc;
  mapping(address => address) private donationAccounts;
  DonationAccountFactory private daf;
  
  constructor(address _usdcAddress, address _cusdcAddress, address _dafAddress) public {
	  usdc = FiatTokenV1(_usdcAddress);
	  cusdc = CErc20(_cusdcAddress);
	  daf = DonationAccountFactory(_dafAddress);
  }

  function createDonationAccount() public {
	  require(donationAccounts[msg.sender] == address(0));
	  address donationAccount = daf.createInstance(address(usdc), address(cusdc));
	  donationAccounts[msg.sender] = donationAccount;
  }

  function isAccountExists() public view returns (bool){
	  return donationAccounts[msg.sender] != address(0);
  }

  function getDonationAccount() public view returns (address) {
	  require(donationAccounts[msg.sender] != address(0));
	  return donationAccounts[msg.sender];
  }

}
