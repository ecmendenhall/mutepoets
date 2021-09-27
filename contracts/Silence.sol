//SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IPoets.sol";

contract Silence is ERC20, ReentrancyGuard, IERC721Receiver {
    struct Vow {
        address owner;
        uint256 tokenId;
        uint256 updated;
    }

    IPoets public poets;
    mapping(uint256 => Vow) public vows;
    mapping(address => uint256[]) public vowsByAddress;
    mapping(uint256 => uint256) public vowByTokenId;

    uint256 private nextVowId;

    constructor(address _poets) ERC20("Silence", "SILENCE") {
        poets = IPoets(_poets);
    }

    function takeVow(uint256 tokenId) public nonReentrant {
        require(poets.ownerOf(tokenId) == msg.sender, "!owner");
        _takeVow(msg.sender, tokenId);
        poets.transferFrom(msg.sender, address(this), tokenId);
    }

    function breakVow(uint256 vowId) public nonReentrant {
        require(vows[vowId].updated != 0, "!vow");
        require(vows[vowId].owner == msg.sender, "!owner");
        uint256 tokenId = vows[vowId].tokenId;
        address owner = vows[vowId].owner;
        uint256 accrued = _claimSilence(vowId);
        delete vowByTokenId[tokenId];
        delete vows[vowId];
        _mint(msg.sender, accrued);
        poets.safeTransferFrom(address(this), owner, tokenId);
    }

    function claim(uint256 vowId) public {
        require(vows[vowId].updated != 0, "!vow");
        require(vows[vowId].owner == msg.sender, "!owner");
        uint256 amount = _claimSilence(vowId);
        _mint(msg.sender, amount);
    }

    function claimAll() public {
        claimBatch(getVowsByAddress(msg.sender));
    }

    function claimBatch(uint256[] memory vowIds) public {
        uint256 total;
        for (uint256 i = 0; i < vowIds.length; i++) {
            if (vows[vowIds[i]].updated != 0) {
                require(vows[vowIds[i]].owner == msg.sender, "!owner");
                total += _claimSilence(vowIds[i]);
            }
        }
        _mint(msg.sender, total);
    }

    function claimable(uint256 vowId) public view returns (uint256) {
        return _claimableSilence(vowId);
    }

    function getVowsByAddress(address owner)
        public
        view
        returns (uint256[] memory)
    {
        return vowsByAddress[owner];
    }

    function onERC721Received(
        address,
        address from,
        uint256 tokenId,
        bytes calldata
    ) public override nonReentrant returns (bytes4) {
        require(msg.sender == address(poets), "!poet");
        if (tokenId > 1024 && vowByTokenId[tokenId] == 0) {
            _takeVow(from, tokenId);
        }
        return this.onERC721Received.selector;
    }

    function _takeVow(address owner, uint256 tokenId) internal {
        require(poets.getWordCount(tokenId) == 0, "!mute");
        nextVowId++;
        vows[nextVowId].owner = owner;
        vows[nextVowId].tokenId = tokenId;
        vows[nextVowId].updated = block.timestamp;
        vowsByAddress[owner].push(nextVowId);
        vowByTokenId[tokenId] = nextVowId;
    }

    function _claimableSilence(uint256 vowId) internal view returns (uint256) {
        uint256 duration = (block.timestamp - vows[vowId].updated) / (1 days);
        return duration * 1e18;
    }

    function _claimSilence(uint256 vowId) internal returns (uint256) {
        uint256 amount = _claimableSilence(vowId);
        vows[vowId].updated = block.timestamp;
        return amount;
    }
}
