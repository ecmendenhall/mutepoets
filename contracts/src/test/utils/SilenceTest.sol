// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "../../../lib/ds-test/src/test.sol";

import "../../Silence.sol";
import "../MockERC20.sol";
import "../MockERC721.sol";
import "../LostPoetPages.sol";
import "../LostPoets.sol";
import "./Hevm.sol";

contract User {
    Silence internal silence;
    LostPoetPages internal lostPoetPages;
    LostPoets internal lostPoets;

    constructor(
        address _silence,
        address _lostPoetPages,
        address _lostPoets
    ) {
        silence = Silence(_silence);
        lostPoetPages = LostPoetPages(_lostPoetPages);
        lostPoets = LostPoets(_lostPoets);
    }

    function takeVow(uint256 tokenId) public {
        silence.takeVow(tokenId);
    }

    function breakVow(uint256 vowId) public {
        silence.breakVow(vowId);
    }

    function claim(uint256 vowId) public {
        silence.claim(vowId);
    }

    function claimBatch(uint256[] calldata vowIds) public {
        silence.claimBatch(vowIds);
    }

    function claimAll() public {
        silence.claimAll();
    }

    function buyPages(uint256 pages) public {
        uint256 cost = 32 * 1e16 * pages;
        lostPoetPages.claimPages{value: cost}(pages);
    }

    function mintPoets(uint256 poets) public {
        for (uint256 i; i < poets; i++) {
            lostPoetPages.safeTransferFrom(
                address(this),
                address(lostPoets),
                1,
                1,
                abi.encode(0)
            );
        }
    }

    function addWord(uint256 poetId) public {
        bytes memory data = abi.encode([1, poetId]);
        lostPoetPages.safeTransferFrom(
            address(this),
            address(lostPoets),
            1,
            1,
            data
        );
    }

    function approveTransfer(address to, uint256 poetId) public {
        lostPoets.approve(to, poetId);
    }

    function proposeTransfer(address to, uint256 tokenId) public {
        silence.proposeTransfer(to, tokenId);
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    receive() external payable {}
}

contract SilenceTest is DSTest {
    Hevm internal constant hevm = Hevm(HEVM_ADDRESS);

    // contracts
    MockERC20 internal mockAsh;
    MockERC721 internal mockNFT;
    LostPoetPages internal lostPoetPages;
    LostPoets internal lostPoets;
    Silence internal silence;

    // users
    User internal owner;
    User internal nonOwner;
    User internal poetHolder;
    User internal poetHolder1;
    User internal poetHolder2;

    function setUp() public virtual {
        hevm.warp(1);

        mockAsh = new MockERC20("Mock Ash", "ASH");
        mockNFT = new MockERC721("Not Poets", "NOTLOST");
        lostPoetPages = new LostPoetPages();
        lostPoets = new LostPoets(address(lostPoetPages));
        silence = new Silence(address(lostPoets));

        owner = new User(
            address(silence),
            address(lostPoetPages),
            address(lostPoets)
        );
        nonOwner = new User(
            address(silence),
            address(lostPoetPages),
            address(lostPoets)
        );
        poetHolder = new User(
            address(silence),
            address(lostPoetPages),
            address(lostPoets)
        );
        poetHolder1 = new User(
            address(silence),
            address(lostPoetPages),
            address(lostPoets)
        );
        poetHolder2 = new User(
            address(silence),
            address(lostPoetPages),
            address(lostPoets)
        );

        payable(address(owner)).transfer(100 ether);
        payable(address(nonOwner)).transfer(100 ether);
        payable(address(poetHolder)).transfer(100 ether);
        payable(address(poetHolder1)).transfer(100 ether);
        payable(address(poetHolder2)).transfer(100 ether);

        silence.transferOwnership(address(owner));
        lostPoetPages.activate(0, 0, type(uint256).max, address(mockAsh), 0);
        lostPoets.enableRedemption(type(uint256).max);
        lostPoets.lockWords(false);
    }
}
