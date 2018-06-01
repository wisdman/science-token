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

  // How many token units a buyer gets per wei
  uint256 public rate;

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
   * @param _rate Number of token units a buyer gets per wei
   */
  constructor(ERC20 _token, uint256 _rate) public {
    require(_token != address(0));
    require(_rate > 0);
    token = _token;
    rate = _rate;
  }

  /**
   * Crowdsale token purchase logic
   */
  function () external payable {
    require(!isFinalized);

    address self = address(this);
    address beneficiary = msg.sender;
    uint256 weiAmount = msg.value;

    require(beneficiary != address(0));
    require(weiAmount != 0);

    uint256 tokens = weiAmount.mul(rate);
    uint256 balance = token.balanceOf(self);

    require(tokens <= balance);

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
    address self = address(this);
    uint256 balance = token.balanceOf(self);
    token.transfer(msg.sender, balance);
  }
}