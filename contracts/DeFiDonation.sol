pragma solidity 0.5.16;
import "./DonationAccountFactory.sol";
import "./ExternalContractInterface.sol";

contract DeFiDonation {
  USDCInterface private usdc;
  CTokenInterface private cusdc;
  mapping(address => address) private donationAccounts;
  DonationAccountFactory private daf;
  
  constructor(address _usdcAddress, address _cusdcAddress, address _dafAddress) public {
    usdc = USDCInterface(_usdcAddress);
    cusdc = CTokenInterface(_cusdcAddress);
    daf = DonationAccountFactory(_dafAddress);
  }

  function createDonationAccount() public {
    require(donationAccounts[msg.sender] == address(0));
    address donationAccount = daf.createInstance(address(usdc), address(cusdc), msg.sender);
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
