//SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./interfaces/IPoets.sol";

contract MutePoets is ERC20, IERC721Receiver {
  struct Vow {
    address owner;
    uint256 created;
    uint256 lastClaim;
  }

  IPoets public poets;
  mapping(uint256 => Vow) public vows;

  constructor(address _poets) ERC20("Mute Poets", "SILENCE") {
    poets = IPoets(_poets);
  }

  function takeVow(uint256 tokenId) public {
    vows[tokenId].owner = msg.sender;
    vows[tokenId].created = block.timestamp;
    vows[tokenId].lastClaim = block.timestamp;
    poets.safeTransferFrom(msg.sender, address(this), tokenId);
  }

  function breakVow(uint256 tokenId) public {
    require(vows[tokenId].created != 0, "!vow");
    require(vows[tokenId].owner == address(msg.sender), "!owner");
    poets.safeTransferFrom(address(this), vows[tokenId].owner, tokenId);
  }

  function claim(uint256 tokenId) public {
    require(vows[tokenId].created != 0, "!vow");
    require(vows[tokenId].owner == address(msg.sender), "!owner");
    uint256 duration = (block.timestamp - vows[tokenId].lastClaim) / (1 days);
    vows[tokenId].lastClaim = block.timestamp;
    _mint(msg.sender, 1e18 * duration);
  }

  function onERC721Received(
    address,
    address,
    uint256,
    bytes memory
  ) public virtual override returns (bytes4) {
    return this.onERC721Received.selector;
  }
}
