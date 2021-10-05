//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IPoets.sol";

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

    event TakeVow(address indexed owner, uint256 tokenId);
    event BreakVow(address indexed owner, uint256 vowId, uint256 tokenId);
    event Claim(address indexed owner, uint256 vowId, uint256 amount);
    event ClaimBatch(address indexed owner, uint256[] vowIds, uint256 total);
    event ProposeTransfer(address indexed to, uint256 tokenId);

    IPoets public immutable Poets;
    mapping(uint256 => Vow) public vows;
    mapping(address => uint256[]) public vowsByAddress;
    mapping(uint256 => TokenTransfer) public proposals;

    uint256 public proposalCount;
    uint256 public vowCount;

    uint256 private constant VOW_VESTING = 160 days;
    uint256 private constant MAX_DAILY_SILENCE = 5e18;
    uint256 private constant MIN_DAILY_SILENCE = 1e18;

    constructor(address _poets) ERC20("Silence", "SILENCE") {
        Poets = IPoets(_poets);
    }

    function takeVow(uint256 tokenId) external nonReentrant {
        require(Poets.ownerOf(tokenId) == msg.sender, "!tokenOwner");
        _takeVow(msg.sender, tokenId);
        Poets.transferFrom(msg.sender, address(this), tokenId);
        emit TakeVow(msg.sender, tokenId);
    }

    function breakVow(uint256 vowId) external nonReentrant {
        address tokenOwner = vows[vowId].tokenOwner;
        require(vows[vowId].updated != 0, "!vow");
        require(tokenOwner == msg.sender, "!tokenOwner");
        uint256 tokenId = vows[vowId].tokenId;
        uint256 accrued = _claimSilence(vowId);
        delete vows[vowId];
        _mint(msg.sender, accrued);
        Poets.safeTransferFrom(address(this), tokenOwner, tokenId);
        emit BreakVow(tokenOwner, vowId, tokenId);
    }

    function claim(uint256 vowId) external {
        require(vows[vowId].updated != 0, "!vow");
        require(vows[vowId].tokenOwner == msg.sender, "!tokenOwner");
        uint256 amount = _claimSilence(vowId);
        _mint(msg.sender, amount);
        emit Claim(msg.sender, vowId, amount);
    }

    function claimAll() external {
        claimBatch(getVowsByAddress(msg.sender));
    }

    function claimBatch(uint256[] memory vowIds) public {
        uint256 total = 0;
        for (uint256 i = 0; i < vowIds.length; i++) {
            uint256 vowId = vowIds[i];
            if (vows[vowId].updated != 0) {
                require(vows[vowId].tokenOwner == msg.sender, "!tokenOwner");
                uint256 amount = _claimSilence(vowId);
                total += amount;
            }
        }
        _mint(msg.sender, total);
        emit ClaimBatch(msg.sender, vowIds, total);
    }

    function proposeTransfer(address to, uint256 tokenId) external onlyOwner {
        proposalCount++;
        proposals[proposalCount].to = to;
        proposals[proposalCount].tokenId = tokenId;
        proposals[proposalCount].timelock = block.timestamp + 7 days;
        emit ProposeTransfer(to, tokenId);
    }

    function executeTransfer(uint256 id) external onlyOwner {
        address to = proposals[id].to;
        uint256 tokenId = proposals[id].tokenId;
        require(to != address(0), "!proposal");
        require(tokenId < 1025, "!origin");
        require(proposals[id].timelock < block.timestamp, "timelock");
        Poets.safeTransferFrom(address(this), to, tokenId);
    }

    function claimable(uint256 vowId) external view returns (uint256) {
        return _claimableSilence(vowId);
    }

    function accrualRate(uint256 vowId) external view returns (uint256) {
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
        require(msg.sender == address(Poets), "!poet");
        require(tokenId < 1025, "!origin");
        return this.onERC721Received.selector;
    }

    function _takeVow(address tokenOwner, uint256 tokenId) internal {
        require(Poets.getWordCount(tokenId) == 0, "!mute");
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
        if (vowLength >= VOW_VESTING) {
            return MAX_DAILY_SILENCE;
        } else {
            return
                MIN_DAILY_SILENCE +
                ((vowLength * (MAX_DAILY_SILENCE - MIN_DAILY_SILENCE)) /
                    VOW_VESTING);
        }
    }

    function _claimableSilence(uint256 vowId) internal view returns (uint256) {
        uint256 updated = vows[vowId].updated;
        uint256 duration = (block.timestamp - updated);
        uint256 breakpoint = vows[vowId].created + VOW_VESTING;

        if (updated == 0) {
            return 0;
        } else if (updated >= breakpoint) {
            return _stableAccrual(duration);
        } else if (block.timestamp > breakpoint) {
            uint256 stableInterval = block.timestamp - breakpoint;
            uint256 increasingInterval = breakpoint - updated;
            uint256 rate1 = _accrualRate(vowId, updated);
            return
                _increasingAccrual(
                    rate1,
                    MAX_DAILY_SILENCE,
                    increasingInterval
                ) + _stableAccrual(stableInterval);
        } else {
            uint256 rate1 = _accrualRate(vowId, updated);
            uint256 rate2 = _accrualRate(vowId, block.timestamp);
            return _increasingAccrual(rate1, rate2, duration);
        }
    }

    function _stableAccrual(uint256 duration) internal pure returns (uint256) {
        return (MAX_DAILY_SILENCE * duration) / (1 days);
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
