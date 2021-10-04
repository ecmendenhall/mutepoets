//SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IPoets.sol";

import "hardhat/console.sol";

contract Silence is ERC20, ReentrancyGuard, Ownable, IERC721Receiver {
    struct Vow {
        address tokenOwner;
        uint256 tokenId;
        uint256 created;
        uint256 updated;
    }

    struct TokenTransfer {
        address to;
        uint256 tokenId;
        uint256 timelock;
    }

    IPoets public poets;
    mapping(uint256 => Vow) public vows;
    mapping(address => uint256[]) public vowsByAddress;
    mapping(uint256 => TokenTransfer) public proposals;

    uint256 public proposalCount;
    uint256 public vowCount;

    uint256 constant ACCRUAL_CAP = 160 days;

    constructor(address _poets) ERC20("Silence", "SILENCE") {
        poets = IPoets(_poets);
    }

    function takeVow(uint256 tokenId) external nonReentrant {
        require(poets.ownerOf(tokenId) == msg.sender, "!tokenOwner");
        _takeVow(msg.sender, tokenId);
        poets.transferFrom(msg.sender, address(this), tokenId);
    }

    function breakVow(uint256 vowId) external nonReentrant {
        address tokenOwner = vows[vowId].tokenOwner;
        require(vows[vowId].updated != 0, "!vow");
        require(tokenOwner == msg.sender, "!tokenOwner");
        uint256 tokenId = vows[vowId].tokenId;
        uint256 accrued = _claimSilence(vowId);
        delete vows[vowId];
        _mint(msg.sender, accrued);
        poets.safeTransferFrom(address(this), tokenOwner, tokenId);
    }

    function claim(uint256 vowId) external {
        require(vows[vowId].updated != 0, "!vow");
        require(vows[vowId].tokenOwner == msg.sender, "!tokenOwner");
        uint256 amount = _claimSilence(vowId);
        _mint(msg.sender, amount);
    }

    function claimAll() external {
        claimBatch(getVowsByAddress(msg.sender));
    }

    function claimBatch(uint256[] memory vowIds) public {
        uint256 total;
        for (uint256 i = 0; i < vowIds.length; i++) {
            if (vows[vowIds[i]].updated != 0) {
                require(
                    vows[vowIds[i]].tokenOwner == msg.sender,
                    "!tokenOwner"
                );
                total += _claimSilence(vowIds[i]);
            }
        }
        _mint(msg.sender, total);
    }

    function proposeTransfer(address to, uint256 tokenId) external onlyOwner {
        proposalCount++;
        proposals[proposalCount].to = to;
        proposals[proposalCount].tokenId = tokenId;
        proposals[proposalCount].timelock = block.timestamp + 7 days;
    }

    function executeTransfer(uint256 id) external onlyOwner {
        address to = proposals[id].to;
        uint256 tokenId = proposals[id].tokenId;
        require(to != address(0), "!proposal");
        require(tokenId < 1025, "!origin");
        require(proposals[id].timelock < block.timestamp, "timelock");
        poets.safeTransferFrom(address(this), to, tokenId);
    }

    function claimable(uint256 vowId) external view returns (uint256) {
        return _claimableSilence(vowId);
    }

    function accrualRate(uint256 vowId) public view returns (uint256) {
        return _accrualRate(vowId, block.timestamp);
    }

    function getVowsByAddress(address tokenOwner)
        public
        view
        returns (uint256[] memory)
    {
        return vowsByAddress[tokenOwner];
    }

    function onERC721Received(
        address,
        address,
        uint256 tokenId,
        bytes calldata
    ) external override nonReentrant returns (bytes4) {
        require(msg.sender == address(poets), "!poet");
        require(tokenId < 1025, "!origin");
        return this.onERC721Received.selector;
    }

    function _takeVow(address tokenOwner, uint256 tokenId) internal {
        require(poets.getWordCount(tokenId) == 0, "!mute");
        vowCount++;
        vows[vowCount].tokenOwner = tokenOwner;
        vows[vowCount].tokenId = tokenId;
        vows[vowCount].created = block.timestamp;
        vows[vowCount].updated = block.timestamp;
        vowsByAddress[tokenOwner].push(vowCount);
    }

    function _accrualRate(uint256 vowId, uint256 timestamp)
        internal
        view
        returns (uint256)
    {
        uint256 vowLength = timestamp - vows[vowId].created;

        if (vowLength >= ACCRUAL_CAP) {
            return 5e18;
        } else {
            return 1e18 + ((vowLength * 4e18) / ACCRUAL_CAP);
        }
    }

    function _claimableSilence(uint256 vowId) internal view returns (uint256) {
        uint256 updated = vows[vowId].updated;
        uint256 duration = (block.timestamp - vows[vowId].updated);
        uint256 breakpoint = vows[vowId].created + ACCRUAL_CAP;

        if (updated == 0) {
            return 0;
        } else if (updated >= breakpoint) {
            return _stableAccrual(duration);
        } else if (block.timestamp > breakpoint) {
            uint256 stableInterval = block.timestamp - breakpoint;
            uint256 increasingInterval = breakpoint - updated;
            uint256 rate1 = _accrualRate(vowId, updated);
            uint256 rate2 = 5e18;
            return
                _increasingAccrual(rate1, rate2, increasingInterval) +
                _stableAccrual(stableInterval);
        } else {
            uint256 rate1 = _accrualRate(vowId, updated);
            uint256 rate2 = _accrualRate(vowId, block.timestamp);
            return _increasingAccrual(rate1, rate2, duration);
        }
    }

    function _stableAccrual(uint256 duration) internal pure returns (uint256) {
        return (5e18 * duration) / (1 days);
    }

    function _increasingAccrual(
        uint256 r1,
        uint256 r2,
        uint256 duration
    ) internal pure returns (uint256) {
        return (duration * (r1 + r2)) / (2 days);
    }

    function _claimSilence(uint256 vowId) internal returns (uint256) {
        uint256 amount = _claimableSilence(vowId);
        vows[vowId].updated = block.timestamp;
        return amount;
    }
}
