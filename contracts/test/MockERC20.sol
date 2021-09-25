// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
  constructor(string memory name_, string memory symbol_)
    ERC20(name_, symbol_)
  {}

  function mint(address to_, uint256 amount_) public {
    _mint(to_, amount_);
  }

  function burn(address from_, uint256 amount_) public {
    _burn(from_, amount_);
  }
}
