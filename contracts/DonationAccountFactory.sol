//pragma solidity >= 0.5.0 < 0.7.0;
pragma solidity 0.5.16;
import "../centre-tokens/contracts/FiatTokenV1.sol";
import "../compound-protocol/contracts/CErc20.sol";

contract DonationAccountFactory {
  function createInstance(address _usdcAddress, address _cusdcAddress) public returns (address){
    return address(new DonationAccount(_usdcAddress, _cusdcAddress));
  }
}

contract DonationAccount {
  FiatTokenV1 private usdc;
  CErc20 private cusdc;
  uint private depositedBalance;
  uint private suppliedBalance;
  address[] private projects;
  mapping(address => uint) private donateAmount;
  using SafeMath for uint256;

  constructor(address _usdcAddress, address _cusdcAddress) public {
	  usdc = FiatTokenV1(_usdcAddress);
	  cusdc = CErc20(_cusdcAddress);
  }

  /**
   * Emitted when a user deposits into the Contract.
   * @param sender The purchaser of the tickets
   * @param amount The size of the deposit
   */
  event Deposited(address indexed sender, uint256 amount);

  /**
   * Emitted when a user supplies into the Compound.
   * @param sender The purchaser of the tickets
   * @param amount The size of the deposit
   */
  event Supplied(address indexed sender, uint256 amount);


  event AddProject(address _address, uint256 amount);

  /**
   * @notice Deposits.  Updates their balance and transfers their tokens into this contract.
   * @param _amount The amount they are depositing
   */
  function _deposit(uint _amount) public {
    // Transfer the tokens into this contract
    require(usdc.transferFrom(msg.sender, address(this), _amount), "Transfer Fail");

    // Update the user's balance
    depositedBalance = depositedBalance.add(_amount);

	emit Deposited(msg.sender, _amount);
  }

  function supply(uint _amount) public {
    _deposit(_amount);
    usdc.approve(address(cusdc),_amount);
    assert(cusdc.mint(_amount) == 0);
    suppliedBalance = suppliedBalance.add(_amount);

	emit Supplied(msg.sender, _amount);
  }

  function addDonateProject(address _projectAddress, uint _amount) public {
    projects.push(_projectAddress);
	emit AddProject(_projectAddress, _amount);
    donateAmount[_projectAddress] = donateAmount[_projectAddress].add(_amount);
  }

  function getUnderlyingBalance() public returns(uint) {
    return cusdc.balanceOfUnderlying(address(this));
  }

  function getInterestBalance() public returns(uint) {
    uint _balance = cusdc.balanceOfUnderlying(address(this));
    return _balance.sub(suppliedBalance);
  }

  function donate(address _projectAddress) public {
    uint _amount = donateAmount[_projectAddress];
    require(cusdc.redeemUnderlying(_amount) == 0, "something went wrong");
    require(usdc.transfer(_projectAddress, _amount), "Transfer Fail");
	uint length = projects.length;
	for(uint i = 0; i < length; i++ ) {
		if (projects[i] == _projectAddress) {
	      delete projects[i];
		}
	}
	delete donateAmount[_projectAddress];
  }

  function redeem(uint _amount) public {
	uint length = projects.length;
	for(uint i = 0; i < length; i++ ) {
      require(projects[i] == address(0), "you have to donate first");
	}
    require(cusdc.redeemUnderlying(_amount) == 0, "something went wrong");
    require(usdc.transfer(msg.sender, _amount), "Transfer Fail");
  } 
}
