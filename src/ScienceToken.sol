pragma solidity ^0.4.24;


import "./lib/StandardToken.sol";


/**
 * @title Science Token (ST)
 */
contract ScienceToken is StandardToken {

  string public constant name = "Science-Token";
  string public constant symbol = "ST";
  uint8 public constant decimals = 8;

  uint256 public constant INITIAL_SUPPLY = 500000000 * (10 ** uint256(decimals));

  constructor() public {
    totalSupply_ = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
    emit Transfer(0x0, msg.sender, INITIAL_SUPPLY);
  }

}