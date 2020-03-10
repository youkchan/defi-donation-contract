pragma solidity 0.5.16;
import "./ExternalContractInterface.sol";
import "@openzeppelin/upgrades/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";

contract DonationAccountFactory {
  function createInstance(address _usdcAddress, address _cusdcAddress, address _newOwner) public returns (address){
    DonationAccount account = new DonationAccount(_usdcAddress, _cusdcAddress);
    account.transferOwnership(_newOwner);
    return address(account);
  }
}

contract DonationAccount is OpenZeppelinUpgradesOwnable{
  USDCInterface private usdc;
  CTokenInterface private cusdc;
  address[] private projects;
  mapping(address => uint) private donateAmount;
  using SafeMath for uint256;

  constructor(address _usdcAddress, address _cusdcAddress) public {
    usdc = USDCInterface(_usdcAddress);
    cusdc = CTokenInterface(_cusdcAddress);
  }

  event Deposited(address indexed sender, uint256 amount);

  event Supplied(address indexed sender, uint256 amount);

  function _deposit(uint _amount) public onlyOwner{
    require(usdc.transferFrom(msg.sender, address(this), _amount), "Transfer Fail");
    emit Deposited(msg.sender, _amount);
  }

  function supply(uint _amount) public onlyOwner{
    _deposit(_amount);
    usdc.approve(address(cusdc),_amount);
    assert(cusdc.mint(_amount) == 0);
    emit Supplied(msg.sender, _amount);
  }

  function addDonateProject(address _projectAddress, uint _amount) public onlyOwner{
    projects.push(_projectAddress);
    donateAmount[_projectAddress] = donateAmount[_projectAddress].add(_amount);
  }

  function getUnderlyingBalance() public onlyOwner returns(uint){
    return cusdc.balanceOfUnderlying(address(this));
  }

  function donate(address _projectAddress) public onlyOwner{
    require(donateAmount[_projectAddress] != 0);
    uint _amount = donateAmount[_projectAddress];
    require(cusdc.redeemUnderlying(_amount) == 0, "Something went wrong");
    require(usdc.transfer(_projectAddress, _amount), "Transfer Fail");
    uint length = projects.length;
    for(uint i = 0; i < length; i++ ) {
      if (projects[i] == _projectAddress) {
        delete projects[i];
      }
    }
    delete donateAmount[_projectAddress];
  }

  function redeem(uint _amount) public onlyOwner{
    uint length = projects.length;
    for(uint i = 0; i < length; i++ ) {
      require(projects[i] == address(0), "You have to donate first");
    }
    require(cusdc.redeemUnderlying(_amount) == 0, "Something went wrong");
    require(usdc.transfer(msg.sender, _amount), "Transfer Fail");
  }

  function getDonateAmount(address _projectAddress) public onlyOwner view returns(uint) {
    return donateAmount[_projectAddress];
  } 
}
