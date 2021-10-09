// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./utils/SilenceTest.sol";

contract TestConstructor is SilenceTest {
    function test_stores_poets_address() public {
        assertEq(address(silence.Poets()), address(lostPoets));
    }
}

contract TestERC20 is SilenceTest {
    function test_has_token_name() public {
        assertEq(silence.name(), "Silence");
    }

    function test_has_token_symbol() public {
        assertEq(silence.symbol(), "SILENCE");
    }

    function test_has_18_decimals() public {
        assertEq(silence.decimals(), 18);
    }
}

contract TestGetVowsByAddress is SilenceTest {
    function setUp() public override {
        super.setUp();
        poetHolder1.buyPages(3);
        poetHolder2.buyPages(3);
        poetHolder1.mintPoets(3);
        poetHolder2.mintPoets(3);
        poetHolder1.approveTransfer(address(silence), 1025);
        poetHolder1.approveTransfer(address(silence), 1026);
        poetHolder1.approveTransfer(address(silence), 1027);
        poetHolder2.approveTransfer(address(silence), 1028);
        poetHolder2.approveTransfer(address(silence), 1029);
        poetHolder2.approveTransfer(address(silence), 1030);
        poetHolder1.takeVow(1025);
    }

    function test_returns_all_vow_ids_for_given_address() public {
        uint256[] memory holder1Vows = silence.getVowsByAddress(
            address(poetHolder1)
        );
        assertEq(holder1Vows.length, 1);
        assertEq(holder1Vows[0], 1);

        poetHolder1.takeVow(1026);
        holder1Vows = silence.getVowsByAddress(address(poetHolder1));
        assertEq(holder1Vows.length, 2);
        assertEq(holder1Vows[0], 1);
        assertEq(holder1Vows[1], 2);

        poetHolder2.takeVow(1028);
        poetHolder2.takeVow(1029);
        poetHolder1.takeVow(1027);
        holder1Vows = silence.getVowsByAddress(address(poetHolder1));
        assertEq(holder1Vows.length, 3);
        assertEq(holder1Vows[0], 1);
        assertEq(holder1Vows[1], 2);
        assertEq(holder1Vows[2], 5);
        uint256[] memory holder2Vows = silence.getVowsByAddress(
            address(poetHolder2)
        );
        assertEq(holder2Vows.length, 2);
        assertEq(holder2Vows[0], 3);
        assertEq(holder2Vows[1], 4);

        poetHolder2.takeVow(1030);
        holder2Vows = silence.getVowsByAddress(address(poetHolder2));
        assertEq(holder2Vows.length, 3);
        assertEq(holder2Vows[0], 3);
        assertEq(holder2Vows[1], 4);
        assertEq(holder2Vows[2], 6);
    }

    function test_does_not_remove_vow_ids_when_broken() public {
        uint256[] memory holder1Vows = silence.getVowsByAddress(
            address(poetHolder1)
        );
        assertEq(holder1Vows.length, 1);
        assertEq(holder1Vows[0], 1);

        poetHolder1.breakVow(1);

        holder1Vows = silence.getVowsByAddress(address(poetHolder1));
        assertEq(holder1Vows.length, 1);
        assertEq(holder1Vows[0], 1);
    }
}

contract TestCounters is SilenceTest {
    function setUp() public override {
        super.setUp();
        poetHolder.buyPages(1);
        poetHolder.mintPoets(1);
        poetHolder.approveTransfer(address(silence), 1025);
    }

    function test_returns_vow_count() public {
        assertEq(silence.vowCount(), 0);
        poetHolder.takeVow(1025);
        assertEq(silence.vowCount(), 1);
    }

    function test_returns_proposal_count() public {
        assertEq(silence.proposalCount(), 0);
        owner.proposeTransfer(address(nonOwner), 100);
        assertEq(silence.proposalCount(), 1);
    }
}

contract TestTakeVow is SilenceTest {
    function setUp() public override {
        super.setUp();
        poetHolder.buyPages(1);
        poetHolder.mintPoets(1);
        poetHolder.approveTransfer(address(silence), 1025);
    }

    function testFail_if_token_does_not_exist() public {
        poetHolder.takeVow(1026);
    }

    function testFail_if_caller_is_not_token_owner() public {
        nonOwner.takeVow(1025);
    }

    function testFail_if_poet_is_not_mute() public {
        poetHolder.buyPages(10);
        poetHolder.addWord(1025);
        hevm.roll(1);
        assertEq(lostPoets.getWordCount(1025), 3);
        poetHolder.takeVow(1025);
    }

    function test_transfers_poet() public {
        assertEq(lostPoets.balanceOf(address(poetHolder)), 1);
        assertEq(lostPoets.balanceOf(address(silence)), 0);
        assertEq(lostPoets.ownerOf(1025), address(poetHolder));

        poetHolder.takeVow(1025);

        assertEq(lostPoets.balanceOf(address(poetHolder)), 0);
        assertEq(lostPoets.balanceOf(address(silence)), 1);
        assertEq(lostPoets.ownerOf(1025), address(silence));
    }

    function test_creates_vow_record() public {
        poetHolder.takeVow(1025);
        (
            address tokenOwner,
            uint256 tokenId,
            uint256 created,
            uint256 updated
        ) = silence.vows(1);
        assertEq(tokenOwner, address(poetHolder));
        assertEq(tokenId, 1025);
        assertEq(created, 1);
        assertEq(updated, 1);
    }
}

contract TestBreakVow is SilenceTest {
    function setUp() public override {
        super.setUp();
        poetHolder.buyPages(1);
        poetHolder.mintPoets(1);
        poetHolder.approveTransfer(address(silence), 1025);
        poetHolder.takeVow(1025);
    }

    function testFail_if_vow_does_not_exist() public {
        poetHolder.breakVow(2);
    }

    function testFail_if_caller_is_not_owner() public {
        nonOwner.breakVow(1);
    }

    function test_transfers_back_poet() public {
        assertEq(lostPoets.balanceOf(address(poetHolder)), 0);
        assertEq(lostPoets.balanceOf(address(silence)), 1);
        assertEq(lostPoets.ownerOf(1025), address(silence));

        poetHolder.breakVow(1);

        assertEq(lostPoets.balanceOf(address(poetHolder)), 1);
        assertEq(lostPoets.balanceOf(address(silence)), 0);
        assertEq(lostPoets.ownerOf(1025), address(poetHolder));
    }

    function test_transfers_accrued_silence() public {
        hevm.warp(block.timestamp + 9 days);
        poetHolder.breakVow(1);

        assertEq(silence.balanceOf(address(poetHolder)), 9.45 ether);
    }

    function test_deletes_vow() public {
        poetHolder.breakVow(1);

        (
            address tokenOwner,
            uint256 tokenId,
            uint256 created,
            uint256 updated
        ) = silence.vows(1);
        assertEq(tokenOwner, address(0));
        assertEq(tokenId, 0);
        assertEq(created, 0);
        assertEq(updated, 0);
    }
}

contract TestClaim is SilenceTest {
    function setUp() public override {
        super.setUp();
        poetHolder.buyPages(1);
        poetHolder.mintPoets(1);
        poetHolder.approveTransfer(address(silence), 1025);
        poetHolder.takeVow(1025);

        poetHolder2.buyPages(1);
        poetHolder2.mintPoets(1);
        poetHolder2.approveTransfer(address(silence), 1026);
        poetHolder2.takeVow(1026);
    }

    function testFail_if_vow_does_not_exist() public {
        poetHolder.claim(2);
    }

    function test_transfers_at_least_1_silence_per_day() public {
        assertEq(silence.balanceOf(address(poetHolder)), 0);

        poetHolder.claim(1);

        hevm.warp(block.timestamp + 1 days);
        poetHolder.claim(1);

        assertEq(silence.balanceOf(address(poetHolder)), 1005555555555555555);

        hevm.warp(block.timestamp + 1 days);
        poetHolder.claim(1);

        assertEq(silence.balanceOf(address(poetHolder)), 2022222222222222221);

        hevm.warp(block.timestamp + 1 days);
        poetHolder.claim(1);

        assertEq(silence.balanceOf(address(poetHolder)), 3049999999999999998);
    }

    function test_multiple_small_claims_equivalent_to_one_large_claim(
        uint8 claims
    ) public {
        assertEq(silence.balanceOf(address(poetHolder)), 0);
        assertEq(silence.balanceOf(address(poetHolder2)), 0);

        for (uint256 i = 0; i < claims; i++) {
            hevm.warp(block.timestamp + 1 days);
            poetHolder.claim(1);
        }

        poetHolder2.claim(2);

        uint256 difference = silence.balanceOf(address(poetHolder2)) -
            silence.balanceOf(address(poetHolder));

        assertLt(difference, 1000);
    }
}

contract TestClaimBatch is SilenceTest {
    function setUp() public override {
        super.setUp();
        poetHolder.buyPages(3);
        poetHolder.mintPoets(3);
        for (uint256 i; i < 3; i++) {
            uint256 tokenId = 1025 + i;
            poetHolder.approveTransfer(address(silence), tokenId);
            poetHolder.takeVow(tokenId);
        }
    }

    function test_claims_accrued_silence_for_batch() public {
        assertEq(silence.balanceOf(address(poetHolder)), 0);

        hevm.warp(block.timestamp + 9 days);
        uint256[] memory batch = new uint256[](3);
        batch[0] = 1;
        batch[1] = 2;
        batch[2] = 3;
        poetHolder.claimBatch(batch);

        assertEq(silence.balanceOf(address(poetHolder)), 28.35 ether);
    }

    function test_ignores_invalid_vows() public {
        assertEq(silence.balanceOf(address(poetHolder)), 0);

        hevm.warp(block.timestamp + 9 days);
        uint256[] memory batch = new uint256[](3);
        batch[0] = 1;
        batch[1] = 1234;
        poetHolder.claimBatch(batch);

        assertEq(silence.balanceOf(address(poetHolder)), 9.45 ether);
    }

    function testFail_on_unowned_vow() public {
        assertEq(silence.balanceOf(address(poetHolder)), 0);

        hevm.warp(block.timestamp + 1 days);
        uint256[] memory batch = new uint256[](3);
        batch[0] = 1;
        batch[1] = 2;
        batch[2] = 3;
        nonOwner.claimBatch(batch);
    }

    function test_claim_batch_equivalent_to_individual_claims(uint8 vowCount)
        public
    {
        if (vowCount == 0) return;
        poetHolder1.buyPages(vowCount);
        poetHolder1.mintPoets(vowCount);
        poetHolder2.buyPages(vowCount);
        poetHolder2.mintPoets(vowCount);
        for (uint256 i; i < vowCount; i++) {
            uint256 tokenId1 = 1028 + i;
            poetHolder1.approveTransfer(address(silence), tokenId1);
            poetHolder1.takeVow(tokenId1);

            uint256 tokenId2 = 1028 + vowCount + i;
            poetHolder2.approveTransfer(address(silence), tokenId2);
            poetHolder2.takeVow(tokenId2);
        }

        assertEq(silence.balanceOf(address(poetHolder1)), 0);
        assertEq(silence.balanceOf(address(poetHolder2)), 0);

        hevm.warp(block.timestamp + 9 days);
        uint256[] memory batch = new uint256[](vowCount);
        for (uint256 i = 0; i < vowCount; i++) {
            uint256 j = 2 * i;
            batch[i] = 4 + j;
            poetHolder2.claim(5 + j);
        }
        poetHolder1.claimBatch(batch);

        assertEq(
            silence.balanceOf(address(poetHolder1)),
            silence.balanceOf(address(poetHolder2))
        );
    }
}

contract TestClaimAll is SilenceTest {
    function setUp() public override {
        super.setUp();
        poetHolder.buyPages(10);
        poetHolder.mintPoets(10);
        for (uint256 i; i < 10; i++) {
            uint256 tokenId = 1025 + i;
            poetHolder.approveTransfer(address(silence), tokenId);
            poetHolder.takeVow(tokenId);
        }
    }

    function test_claims_all_accrued_silence() public {
        assertEq(silence.balanceOf(address(poetHolder)), 0);

        hevm.warp(block.timestamp + 9 days);
        poetHolder.claimAll();

        assertEq(silence.balanceOf(address(poetHolder)), 94.5 ether);
    }

    function test_handles_broken_vows() public {
        assertEq(silence.balanceOf(address(poetHolder)), 0);
        poetHolder.breakVow(1);
        poetHolder.breakVow(5);

        hevm.warp(block.timestamp + 9 days);
        poetHolder.claimAll();

        assertEq(silence.balanceOf(address(poetHolder)), 75.6 ether);
    }
}

contract TestAccrualRate is SilenceTest {
    function setUp() public override {
        super.setUp();
        poetHolder.buyPages(1);
        poetHolder.mintPoets(1);
        poetHolder.approveTransfer(address(silence), 1025);
        poetHolder.takeVow(1025);
    }

    function test_silence_accrual_rates() public {
        assertEq(silence.accrualRate(1), 1 ether);

        hevm.warp(block.timestamp + 9 days);
        assertEq(silence.accrualRate(1), 1.1 ether);

        hevm.warp(block.timestamp + 81 days);
        assertEq(silence.accrualRate(1), 2 ether);

        hevm.warp(block.timestamp + 90 days);
        assertEq(silence.accrualRate(1), 3 ether);

        hevm.warp(block.timestamp + 90 days);
        assertEq(silence.accrualRate(1), 4 ether);

        hevm.warp(block.timestamp + 90 days);
        assertEq(silence.accrualRate(1), 5 ether);

        hevm.warp(block.timestamp + 1);
        assertEq(silence.accrualRate(1), 0);
    }

    function test_accrual_rate_does_not_exceed_5_during_silent_era(
        uint8 accrualDays
    ) public {
        hevm.warp(block.timestamp + uint256(accrualDays) * 1 days);
        assertGe(silence.accrualRate(1), 1 ether);
        assertLe(silence.accrualRate(1), 5 ether);
    }

    function test_accrual_rate_zero_after_silent_era(uint8 additionalDays)
        public
    {
        hevm.warp(
            block.timestamp + 360 days + 1 + uint256(additionalDays) * 1 days
        );
        assertEq(silence.accrualRate(1), 0 ether);
    }
}

contract TestClaimable is SilenceTest {
    function setUp() public override {
        super.setUp();
        poetHolder.buyPages(1);
        poetHolder.mintPoets(1);
        poetHolder.approveTransfer(address(silence), 1025);
        poetHolder.takeVow(1025);
    }

    function test_accrued_silence() public {
        assertEq(silence.claimable(1), 0);

        hevm.warp(block.timestamp + 1 days);
        assertEq(silence.claimable(1), 1005555555555555555);

        hevm.warp(block.timestamp + 1 days);
        assertEq(silence.claimable(1), 2022222222222222222);

        hevm.warp(block.timestamp + 1 days);
        assertEq(silence.claimable(1), 3049999999999999999);

        poetHolder.claim(1);

        hevm.warp(block.timestamp + 1 days);
        assertEq(silence.claimable(1), 1038888888888888888);
    }

    function test_10_days() public {
        hevm.warp(block.timestamp + 9 days);
        assertEq(silence.claimable(1), 9.45 ether);
    }

    function test_90_days() public {
        hevm.warp(block.timestamp + 90 days);
        assertEq(silence.claimable(1), 135 ether);
    }

    function test_180_days() public {
        hevm.warp(block.timestamp + 180 days);
        assertEq(silence.claimable(1), 360 ether);
    }

    function test_270_days() public {
        hevm.warp(block.timestamp + 270 days);
        assertEq(silence.claimable(1), 675 ether);
    }

    function test_360_days() public {
        hevm.warp(block.timestamp + 360 days);
        assertEq(silence.claimable(1), 1080 ether);
    }

    function test_365_days() public {
        hevm.warp(block.timestamp + 365 days);
        assertEq(silence.claimable(1), 1080 ether);
    }

    function test_max_claim(uint8 extraDays) public {
        hevm.warp(block.timestamp + 360 days + 1 + extraDays);
        assertEq(silence.claimable(1), 1080 ether);
    }

    function test_earlier_vows_have_higher_claimable(uint8 duration) public {
        poetHolder2.buyPages(1);
        poetHolder2.mintPoets(1);
        poetHolder2.approveTransfer(address(silence), 1026);

        hevm.warp(block.timestamp + 100 days + duration);
        poetHolder2.takeVow(1026);

        assertGt(silence.claimable(1), silence.claimable(2));
        assertLe(silence.claimable(1), 1080 ether);
        assertLe(silence.claimable(2), 1080 ether);
    }

    function test_returns_zero_for_invalid_vows() public {
        assertEq(silence.claimable(1234), 0);
    }
}
