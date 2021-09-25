//SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./interfaces/IPoets.sol";

contract Silence is ERC20, IERC721Receiver {
    struct Vow {
        address owner;
        uint256 updated;
    }

    IPoets public poets;
    mapping(uint256 => Vow) public vows;

    constructor(address _poets) ERC20("Silence", "SILENCE") {
        poets = IPoets(_poets);
    }

    function takeVow(uint256 tokenId) public {
        require(poets.ownerOf(tokenId) == msg.sender, "!owner");
        require(poets.getWordCount(tokenId) == 0, "!mute");
        vows[tokenId].owner = msg.sender;
        vows[tokenId].updated = block.timestamp;
        poets.safeTransferFrom(msg.sender, address(this), tokenId);
    }

    function breakVow(uint256 tokenId) public {
        require(vows[tokenId].updated != 0, "!vow");
        require(vows[tokenId].owner == msg.sender, "!owner");
        _claimSilence(msg.sender, tokenId);
        poets.safeTransferFrom(address(this), vows[tokenId].owner, tokenId);
        delete vows[tokenId];
    }

    function claim(uint256 tokenId) public {
        require(vows[tokenId].updated != 0, "!vow");
        require(vows[tokenId].owner == msg.sender, "!owner");
        _claimSilence(msg.sender, tokenId);
    }

    function claimable(uint256 tokenId) public view returns (uint256) {
        return _claimableSilence(tokenId);
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function _claimableSilence(uint256 tokenId) internal view returns (uint256) {
        uint256 duration = (block.timestamp - vows[tokenId].updated) / (1 days);
        return duration * 1e18;
    }

    function _claimSilence(address to, uint256 tokenId) internal {
        uint256 amount = _claimableSilence(tokenId);
        vows[tokenId].updated = block.timestamp;
        _mint(to, amount);
    }
}
