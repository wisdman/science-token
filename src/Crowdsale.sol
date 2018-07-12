pragma solidity ^0.4.24;

import "./lib/ERC20.sol";
import "./lib/SafeMath.sol";
import "./lib/Ownable.sol";


/**
 * @title Science Token (ST) Crowdsale contract
 */
contract Crowdsale is Ownable {
  using SafeMath for uint256;

  ERC20 public token;

  // How many wei units a buyer gets per token
  uint256 public price;

  // Amount of wei raised
  uint256 public weiRaised;

  /**
   * Event for token purchase logging
   * @param beneficiary who got the tokens
   * @param value weis paid for purchase
   * @param amount amount of tokens purchased
   */
  event TokenPurchase(
    address indexed beneficiary,
    uint256 value,
    uint256 amount
  );

  bool public isFinalized = false;

  event Finalized();

  /**
   * @param _token Address of the token being sold
   * @param _price How many wei units a buyer gets per token
   */
  constructor(ERC20 _token, uint256 _price) public {
    require(_token != address(0));
    require(_price > 0);
    token = _token;
    price = _price;
  }

  /**
   * Crowdsale token purchase logic
   */
  function () external payable {
    require(!isFinalized);

    address beneficiary = msg.sender;
    uint256 weiAmount = msg.value;

    require(beneficiary != address(0));
    require(weiAmount != 0);

    uint256 tokens = weiAmount.div(price);
    uint256 selfBalance = balance();
    require(tokens > 0);
    require(tokens <= selfBalance);

    // Get tokens to beneficiary
    token.transfer(beneficiary, tokens);

    emit TokenPurchase(
      beneficiary,
      weiAmount,
      tokens
    );

    // Transfet eth to owner
    owner.transfer(msg.value);

    // update state
    weiRaised = weiRaised.add(weiAmount);
  }


  /**
   * Self tokken ballance
   */
  function balance() public view returns (uint256) {
    address self = address(this);
    uint256 selfBalance = token.balanceOf(self);
    return selfBalance;
  }

  /**
   * Set new price
   * @param _price How many wei units a buyer gets per token
   */
  function setPrice(uint256 _price) onlyOwner public {
    require(_price > 0);
    price = _price;
  }

  /**
   * Must be called after crowdsale ends, to do some extra finalization work.
   */
  function finalize() onlyOwner public {
    require(!isFinalized);

    transferBallance();

    emit Finalized();
    isFinalized = true;
  }

  /**
   * Send all token ballance to owner
   */
  function transferBallance() onlyOwner public {
    uint256 selfBalance = balance();
    token.transfer(msg.sender, selfBalance);
  }
}