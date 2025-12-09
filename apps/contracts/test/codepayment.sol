// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test, console} from "forge-std/Test.sol";
import {Gigipay} from "../src/Gigipay.sol";
import {IGigipayEvents} from "../src/interfaces/IGigipayEvents.sol";
import {IGigipayErrors} from "../src/interfaces/IGigipayErrors.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract CodePaymentTest is Test, IGigipayEvents, IGigipayErrors {
    Gigipay public gigipay;
    
    address public admin;
    address public pauser;
    address public sender;
    address public claimer1;
    address public claimer2;
    
    // Test claim codes
    string constant CODE1 = "SECRET123";
    string constant CODE2 = "GIFT2024";
    string constant CODE3 = "PROMO999";
    string constant WRONG_CODE = "WRONGCODE";
    
    // Test voucher names
    string constant VOUCHER1 = "TestVoucher1";
    string constant VOUCHER2 = "TestVoucher2";
    string constant VOUCHER3 = "TestVoucher3";
    string constant VOUCHER4 = "Birthday2024";
    string constant VOUCHER5 = "Christmas2024";
    
    function setUp() public {
        // Create test addresses
        admin = makeAddr("admin");
        pauser = makeAddr("pauser");
        sender = makeAddr("sender");
        claimer1 = makeAddr("claimer1");
        claimer2 = makeAddr("claimer2");
        
        // Deploy implementation
        Gigipay implementation = new Gigipay();
        
        // Deploy proxy and initialize
        bytes memory initData = abi.encodeWithSelector(
            Gigipay.initialize.selector,
            admin,
            pauser
        );
        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), initData);
        gigipay = Gigipay(payable(address(proxy)));
        
        // Fund sender with CELO
        vm.deal(sender, 100 ether);
    }
    
    function test_CreateSingleVoucher() public {
        uint256 amount = 1 ether;
        uint256 expiresAt = block.timestamp + 7 days;
        
        // Expect event emission
        vm.expectEmit(true, true, false, true);
        emit VoucherCreated(0, sender, amount, expiresAt);
        
        // Create single voucher using batch function
        string[] memory codes = new string[](1);
        codes[0] = CODE1;
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;
        uint256[] memory expirationTimes = new uint256[](1);
        expirationTimes[0] = expiresAt;
        
        vm.prank(sender);
        uint256[] memory voucherIds = gigipay.createVoucherBatch{value: amount}(VOUCHER1, codes, amounts, expirationTimes);
        uint256 voucherId = voucherIds[0];
        
        // Verify voucher was created
        assertEq(voucherId, 0, "First voucher should have ID 0");
        
        // Check voucher details
        (
            address voucherSender,
            uint256 voucherAmount,
            ,
            uint256 voucherExpiresAt,
            bool claimed,
            bool refunded,
            string memory voucherName
        ) = gigipay.vouchers(voucherId);
        
        assertEq(voucherSender, sender, "Sender mismatch");
        assertEq(voucherAmount, amount, "Amount mismatch");
        assertEq(voucherExpiresAt, expiresAt, "Expiration mismatch");
        assertFalse(claimed, "Should not be claimed");
        assertFalse(refunded, "Should not be refunded");
        assertEq(voucherName, VOUCHER1, "Voucher name mismatch");
        
        console.log("[SUCCESS] Single voucher created with ID:", voucherId);
        console.log("  Amount:", amount);
        console.log("  Expires at:", expiresAt);
    }
    
    function test_CreateBatchVouchers() public {
        // Create 3 vouchers under ONE campaign name
        string[] memory codes = new string[](3);
        codes[0] = CODE1;
        codes[1] = CODE2;
        codes[2] = CODE3;
        
        uint256[] memory amounts = new uint256[](3);
        amounts[0] = 1 ether;
        amounts[1] = 2 ether;
        amounts[2] = 3 ether;
        
        uint256[] memory expirationTimes = new uint256[](3);
        expirationTimes[0] = block.timestamp + 1 days;
        expirationTimes[1] = block.timestamp + 7 days;
        expirationTimes[2] = block.timestamp + 30 days;
        
        uint256 totalAmount = 6 ether;
        
        vm.prank(sender);
        uint256[] memory voucherIds = gigipay.createVoucherBatch{value: totalAmount}(
            VOUCHER1,  // ONE campaign name for all vouchers
            codes,
            amounts,
            expirationTimes
        );
        
        // Verify all vouchers were created
        assertEq(voucherIds.length, 3, "Should create 3 vouchers");
        assertEq(voucherIds[0], 0, "First voucher ID");
        assertEq(voucherIds[1], 1, "Second voucher ID");
        assertEq(voucherIds[2], 2, "Third voucher ID");
        
        // Check sender's vouchers
        uint256[] memory senderVouchers = gigipay.getSenderVouchers(sender);
        assertEq(senderVouchers.length, 3, "Sender should have 3 vouchers");
        
        // Check vouchers by campaign name
        uint256[] memory campaignVouchers = gigipay.getVouchersByName(VOUCHER1);
        assertEq(campaignVouchers.length, 3, "Campaign should have 3 vouchers");
        
        console.log("[SUCCESS] Batch created 3 vouchers under ONE campaign:", VOUCHER1);
        console.log("  Voucher 0: 1 CELO, expires in 1 day");
        console.log("  Voucher 1: 2 CELO, expires in 7 days");
        console.log("  Voucher 2: 3 CELO, expires in 30 days");
    }
    
    function test_ClaimVoucherWithCorrectCode() public {
        uint256 amount = 5 ether;
        uint256 expiresAt = block.timestamp + 7 days;
        
        // Create voucher
        string[] memory codes = new string[](1);
        codes[0] = CODE1;
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;
        uint256[] memory expirationTimes = new uint256[](1);
        expirationTimes[0] = expiresAt;
        
        vm.prank(sender);
        uint256[] memory voucherIds = gigipay.createVoucherBatch{value: amount}(VOUCHER1, codes, amounts, expirationTimes);
        uint256 voucherId = voucherIds[0];
        
        uint256 claimerBalanceBefore = claimer1.balance;
        uint256 contractBalanceBefore = address(gigipay).balance;
        
        console.log("[BEFORE CLAIM]");
        console.log("  Claimer balance:", claimerBalanceBefore);
        console.log("  Contract balance:", contractBalanceBefore);
        console.log("  Voucher amount:", amount);
        
        // Expect event emission
        vm.expectEmit(true, true, false, true);
        emit VoucherClaimed(voucherId, claimer1, amount);
        
        // Claim voucher by campaign name
        vm.prank(claimer1);
        gigipay.claimVoucher(VOUCHER1, CODE1);
        
        uint256 claimerBalanceAfter = claimer1.balance;
        uint256 contractBalanceAfter = address(gigipay).balance;
        uint256 amountClaimed = claimerBalanceAfter - claimerBalanceBefore;
        
        console.log("[AFTER CLAIM]");
        console.log("  Claimer balance:", claimerBalanceAfter);
        console.log("  Contract balance:", contractBalanceAfter);
        console.log("  Amount claimed:", amountClaimed);
        
        // Verify claim
        (, , , , bool claimed, ,) = gigipay.vouchers(voucherId);
        assertTrue(claimed, "Voucher should be claimed");
        assertEq(amountClaimed, amount, "Claimer should receive exact voucher amount");
        assertEq(contractBalanceAfter, contractBalanceBefore - amount, "Contract balance should decrease");
        
        console.log("[SUCCESS] Voucher claimed by name successfully");
        console.log("  Campaign:", VOUCHER1);
        console.log("  [OK] Claimed amount matches voucher amount:", amount);
    }
    
    function test_RevertClaimWithWrongCode() public {
        uint256 amount = 1 ether;
        uint256 expiresAt = block.timestamp + 7 days;
        
        // Create voucher
        string[] memory codes = new string[](1);
        codes[0] = CODE1;
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;
        uint256[] memory expirationTimes = new uint256[](1);
        expirationTimes[0] = expiresAt;
        
        vm.prank(sender);
        gigipay.createVoucherBatch{value: amount}(VOUCHER1, codes, amounts, expirationTimes);
        
        // Try to claim with wrong code
        vm.prank(claimer1);
        vm.expectRevert(InvalidClaimCode.selector);
        gigipay.claimVoucher(VOUCHER1, WRONG_CODE);
        
        console.log("[SUCCESS] Rejected claim with wrong code");
    }
    
    function test_RevertClaimExpiredVoucher() public {
        uint256 amount = 1 ether;
        uint256 expiresAt = block.timestamp + 1 hours;
        
        // Create voucher
        string[] memory codes = new string[](1);
        codes[0] = CODE1;
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;
        uint256[] memory expirationTimes = new uint256[](1);
        expirationTimes[0] = expiresAt;
        
        vm.prank(sender);
        gigipay.createVoucherBatch{value: amount}(VOUCHER1, codes, amounts, expirationTimes);
        
        // Fast forward past expiration
        vm.warp(block.timestamp + 2 hours);
        
        // Try to claim expired voucher
        vm.prank(claimer1);
        vm.expectRevert(VoucherExpired.selector);
        gigipay.claimVoucher(VOUCHER1, CODE1);
        
        console.log("[SUCCESS] Rejected claim of expired voucher");
    }
    
    function test_RevertDoubleClaimVoucher() public {
        uint256 amount = 1 ether;
        uint256 expiresAt = block.timestamp + 7 days;
        
        // Create voucher
        string[] memory codes = new string[](1);
        codes[0] = CODE1;
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;
        uint256[] memory expirationTimes = new uint256[](1);
        expirationTimes[0] = expiresAt;
        
        vm.prank(sender);
        gigipay.createVoucherBatch{value: amount}(VOUCHER1, codes, amounts, expirationTimes);
        
        // First claim succeeds
        vm.prank(claimer1);
        gigipay.claimVoucher(VOUCHER1, CODE1);
        
        // Second claim should fail with InvalidClaimCode
        // (because the code is skipped in the loop since it's already claimed)
        vm.prank(claimer2);
        vm.expectRevert(InvalidClaimCode.selector);
        gigipay.claimVoucher(VOUCHER1, CODE1);
        
        console.log("[SUCCESS] Prevented double claim");
    }
    
    function test_RefundExpiredVoucher() public {
        uint256 amount = 2 ether;
        uint256 expiresAt = block.timestamp + 1 hours;
        
        // Create voucher
        string[] memory codes = new string[](1);
        codes[0] = CODE1;
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;
        uint256[] memory expirationTimes = new uint256[](1);
        expirationTimes[0] = expiresAt;
        
        vm.prank(sender);
        uint256[] memory voucherIds = gigipay.createVoucherBatch{value: amount}(VOUCHER1, codes, amounts, expirationTimes);
        uint256 voucherId = voucherIds[0];
        
        uint256 senderBalanceBefore = sender.balance;
        
        // Fast forward past expiration
        vm.warp(block.timestamp + 2 hours);
        
        // Expect event emission
        vm.expectEmit(true, true, false, true);
        emit VoucherRefunded(voucherId, sender, amount);
        
        // Refund voucher
        vm.prank(sender);
        gigipay.refundVoucher(voucherId);
        
        uint256 amountRefunded = sender.balance - senderBalanceBefore;
        
        // Verify refund
        (, , , , , bool refunded,) = gigipay.vouchers(voucherId);
        assertTrue(refunded, "Voucher should be refunded");
        assertEq(amountRefunded, amount, "Sender should receive exact refund amount");
        
        console.log("[SUCCESS] Expired voucher refunded");
        console.log("  [OK] Refund amount:", amountRefunded);
    }
    
    function test_RevertRefundBeforeExpiration() public {
        uint256 amount = 1 ether;
        uint256 expiresAt = block.timestamp + 7 days;
        
        // Create voucher
        string[] memory codes = new string[](1);
        codes[0] = CODE1;
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;
        uint256[] memory expirationTimes = new uint256[](1);
        expirationTimes[0] = expiresAt;
        
        vm.prank(sender);
        uint256[] memory voucherIds = gigipay.createVoucherBatch{value: amount}(VOUCHER1, codes, amounts, expirationTimes);
        uint256 voucherId = voucherIds[0];
        
        // Try to refund before expiration
        vm.prank(sender);
        vm.expectRevert(VoucherNotExpired.selector);
        gigipay.refundVoucher(voucherId);
        
        console.log("[SUCCESS] Prevented refund before expiration");
    }
    
    function test_RevertRefundClaimedVoucher() public {
        uint256 amount = 1 ether;
        uint256 expiresAt = block.timestamp + 7 days;
        
        // Create voucher
        string[] memory codes = new string[](1);
        codes[0] = CODE1;
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;
        uint256[] memory expirationTimes = new uint256[](1);
        expirationTimes[0] = expiresAt;
        
        vm.prank(sender);
        uint256[] memory voucherIds = gigipay.createVoucherBatch{value: amount}(VOUCHER1, codes, amounts, expirationTimes);
        uint256 voucherId = voucherIds[0];
        
        // Claim voucher by campaign name
        vm.prank(claimer1);
        gigipay.claimVoucher(VOUCHER1, CODE1);
        
        // Fast forward past expiration
        vm.warp(block.timestamp + 8 days);
        
        // Try to refund claimed voucher
        vm.prank(sender);
        vm.expectRevert(VoucherAlreadyClaimed.selector);
        gigipay.refundVoucher(voucherId);
        
        console.log("[SUCCESS] Prevented refund of claimed voucher");
    }
    
    function test_IsVoucherClaimable() public {
        uint256 amount = 1 ether;
        uint256 expiresAt = block.timestamp + 7 days;
        
        // Create voucher
        string[] memory codes = new string[](1);
        codes[0] = CODE1;
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;
        uint256[] memory expirationTimes = new uint256[](1);
        expirationTimes[0] = expiresAt;
        
        vm.prank(sender);
        uint256[] memory voucherIds = gigipay.createVoucherBatch{value: amount}(VOUCHER1, codes, amounts, expirationTimes);
        uint256 voucherId = voucherIds[0];
        
        // Should be claimable
        assertTrue(gigipay.isVoucherClaimable(voucherId), "Should be claimable");
        
        // Claim it by campaign name
        vm.prank(claimer1);
        gigipay.claimVoucher(VOUCHER1, CODE1);
        
        // Should no longer be claimable
        assertFalse(gigipay.isVoucherClaimable(voucherId), "Should not be claimable after claim");
        
        console.log("[SUCCESS] isVoucherClaimable works correctly");
    }
    
    function test_IsVoucherRefundable() public {
        uint256 amount = 1 ether;
        uint256 expiresAt = block.timestamp + 1 hours;
        
        // Create voucher
        string[] memory codes = new string[](1);
        codes[0] = CODE1;
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;
        uint256[] memory expirationTimes = new uint256[](1);
        expirationTimes[0] = expiresAt;
        
        vm.prank(sender);
        uint256[] memory voucherIds = gigipay.createVoucherBatch{value: amount}(VOUCHER1, codes, amounts, expirationTimes);
        uint256 voucherId = voucherIds[0];
        
        // Should not be refundable yet
        assertFalse(gigipay.isVoucherRefundable(voucherId), "Should not be refundable before expiry");
        
        // Fast forward past expiration
        vm.warp(block.timestamp + 2 hours);
        
        // Should be refundable now
        assertTrue(gigipay.isVoucherRefundable(voucherId), "Should be refundable after expiry");
        
        console.log("[SUCCESS] isVoucherRefundable works correctly");
    }
    
    function test_RevertCreateVoucherWithZeroAmount() public {
        uint256 expiresAt = block.timestamp + 7 days;
        
        string[] memory codes = new string[](1);
        codes[0] = CODE1;
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 0;
        uint256[] memory expirationTimes = new uint256[](1);
        expirationTimes[0] = expiresAt;
        
        vm.prank(sender);
        vm.expectRevert(InvalidAmount.selector);
        gigipay.createVoucherBatch{value: 0}(VOUCHER1, codes, amounts, expirationTimes);
        
        console.log("[SUCCESS] Prevented voucher creation with zero amount");
    }
    
    function test_RevertCreateVoucherWithPastExpiration() public {
        uint256 amount = 1 ether;
        
        // Warp to a future time first so we can subtract
        vm.warp(block.timestamp + 10 days);
        uint256 pastTime = block.timestamp - 1 days;
        
        string[] memory codes = new string[](1);
        codes[0] = CODE1;
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;
        uint256[] memory expirationTimes = new uint256[](1);
        expirationTimes[0] = pastTime;
        
        vm.prank(sender);
        vm.expectRevert(InvalidExpirationTime.selector);
        gigipay.createVoucherBatch{value: amount}(VOUCHER1, codes, amounts, expirationTimes);
        
        console.log("[SUCCESS] Prevented voucher with past expiration");
    }
    
    function test_RevertCreateVoucherWithEmptyCode() public {
        uint256 amount = 1 ether;
        uint256 expiresAt = block.timestamp + 7 days;
        
        string[] memory codes = new string[](1);
        codes[0] = "";
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;
        uint256[] memory expirationTimes = new uint256[](1);
        expirationTimes[0] = expiresAt;
        
        vm.prank(sender);
        vm.expectRevert(InvalidClaimCode.selector);
        gigipay.createVoucherBatch{value: amount}(VOUCHER1, codes, amounts, expirationTimes);
        
        console.log("[SUCCESS] Prevented voucher with empty code");
    }
    
    function test_MultipleSendersMultipleVouchers() public {
        address sender2 = makeAddr("sender2");
        vm.deal(sender2, 10 ether);
        
        uint256 expiresAt = block.timestamp + 7 days;
        
        // Sender 1 creates 2 vouchers
        vm.startPrank(sender);
        string[] memory codes1 = new string[](1);
        codes1[0] = CODE1;
        uint256[] memory amounts1 = new uint256[](1);
        amounts1[0] = 1 ether;
        uint256[] memory times1 = new uint256[](1);
        times1[0] = expiresAt;
        gigipay.createVoucherBatch{value: 1 ether}(VOUCHER1, codes1, amounts1, times1);
        
        string[] memory codes2 = new string[](1);
        codes2[0] = CODE2;
        uint256[] memory amounts2 = new uint256[](1);
        amounts2[0] = 2 ether;
        uint256[] memory times2 = new uint256[](1);
        times2[0] = expiresAt;
        gigipay.createVoucherBatch{value: 2 ether}(VOUCHER2, codes2, amounts2, times2);
        vm.stopPrank();
        
        // Sender 2 creates 1 voucher
        vm.prank(sender2);
        string[] memory codes3 = new string[](1);
        codes3[0] = CODE3;
        uint256[] memory amounts3 = new uint256[](1);
        amounts3[0] = 3 ether;
        uint256[] memory times3 = new uint256[](1);
        times3[0] = expiresAt;
        gigipay.createVoucherBatch{value: 3 ether}(VOUCHER3, codes3, amounts3, times3);
        
        // Check sender vouchers
        uint256[] memory sender1Vouchers = gigipay.getSenderVouchers(sender);
        uint256[] memory sender2Vouchers = gigipay.getSenderVouchers(sender2);
        
        assertEq(sender1Vouchers.length, 2, "Sender 1 should have 2 vouchers");
        assertEq(sender2Vouchers.length, 1, "Sender 2 should have 1 voucher");
        
        console.log("[SUCCESS] Multiple senders can create vouchers independently");
        console.log("  Sender 1 vouchers:", sender1Vouchers.length);
        console.log("  Sender 2 vouchers:", sender2Vouchers.length);
    }
    
    function test_VoucherWhenPaused() public {
        uint256 amount = 1 ether;
        uint256 expiresAt = block.timestamp + 7 days;
        
        // Pause contract
        vm.prank(pauser);
        gigipay.pause();
        
        // Try to create voucher when paused
        string[] memory codes = new string[](1);
        codes[0] = CODE1;
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;
        uint256[] memory expirationTimes = new uint256[](1);
        expirationTimes[0] = expiresAt;
        
        vm.prank(sender);
        vm.expectRevert();
        gigipay.createVoucherBatch{value: amount}(VOUCHER1, codes, amounts, expirationTimes);
        
        console.log("[SUCCESS] Prevented voucher creation when paused");
    }
    
    function test_OneNameMultipleCodes() public {
        // Create 5 vouchers under ONE campaign name with different codes and amounts
        string[] memory codes = new string[](5);
        codes[0] = "CODE1";
        codes[1] = "CODE2";
        codes[2] = "CODE3";
        codes[3] = "CODE4";
        codes[4] = "CODE5";
        
        uint256[] memory amounts = new uint256[](5);
        amounts[0] = 10 ether;  // VIP
        amounts[1] = 5 ether;   // Regular
        amounts[2] = 5 ether;   // Regular
        amounts[3] = 2 ether;   // Basic
        amounts[4] = 2 ether;   // Basic
        
        uint256[] memory expirationTimes = new uint256[](5);
        uint256 expiry = block.timestamp + 7 days;
        for (uint i = 0; i < 5; i++) {
            expirationTimes[i] = expiry;
        }
        
        uint256 totalAmount = 24 ether;
        
        console.log("[TEST] Creating campaign with multiple codes...");
        
        vm.prank(sender);
        uint256[] memory voucherIds = gigipay.createVoucherBatch{value: totalAmount}(
            VOUCHER4,  // Campaign: "Birthday2024"
            codes,
            amounts,
            expirationTimes
        );
        
        // Verify all vouchers created
        assertEq(voucherIds.length, 5, "Should create 5 vouchers");
        
        // Verify all under same campaign name
        uint256[] memory campaignVouchers = gigipay.getVouchersByName(VOUCHER4);
        assertEq(campaignVouchers.length, 5, "Campaign should have 5 vouchers");
        
        console.log("[SUCCESS] Created 5 vouchers under campaign:", VOUCHER4);
        console.log("  VIP codes: 1 x 10 CELO");
        console.log("  Regular codes: 2 x 5 CELO");
        console.log("  Basic codes: 2 x 2 CELO");
        
        // Test claiming different codes from same campaign
        console.log("\n[TEST] Claiming vouchers from same campaign...");
        
        // Claimer 1 claims CODE1 (10 CELO)
        uint256 claimer1BalanceBefore = claimer1.balance;
        vm.prank(claimer1);
        gigipay.claimVoucher(VOUCHER4, "CODE1");
        assertEq(claimer1.balance - claimer1BalanceBefore, 10 ether, "Claimer1 should get 10 CELO");
        console.log("  Claimer1 claimed CODE1: 10 CELO");
        
        // Claimer 2 claims CODE2 (5 CELO)
        uint256 claimer2BalanceBefore = claimer2.balance;
        vm.prank(claimer2);
        gigipay.claimVoucher(VOUCHER4, "CODE2");
        assertEq(claimer2.balance - claimer2BalanceBefore, 5 ether, "Claimer2 should get 5 CELO");
        console.log("  Claimer2 claimed CODE2: 5 CELO");
        
        // Claimer 1 claims CODE4 (2 CELO) - same person, different code
        claimer1BalanceBefore = claimer1.balance;
        vm.prank(claimer1);
        gigipay.claimVoucher(VOUCHER4, "CODE4");
        assertEq(claimer1.balance - claimer1BalanceBefore, 2 ether, "Claimer1 should get 2 CELO");
        console.log("  Claimer1 claimed CODE4: 2 CELO (same person, different code)");
        
        // Verify 3 claimed, 2 remaining
        uint256 claimedCount = 0;
        for (uint i = 0; i < voucherIds.length; i++) {
            (, , , , bool claimed, ,) = gigipay.vouchers(voucherIds[i]);
            if (claimed) claimedCount++;
        }
        assertEq(claimedCount, 3, "Should have 3 claimed vouchers");
        
        console.log("\n[SUCCESS] One campaign, multiple codes works perfectly!");
        console.log("  3 codes claimed, 2 remaining");
    }
    
    function test_CannotClaimSameCodeTwice() public {
        // Create campaign with multiple codes
        string[] memory codes = new string[](2);
        codes[0] = CODE1;
        codes[1] = CODE2;
        
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 5 ether;
        amounts[1] = 5 ether;
        
        uint256[] memory expirationTimes = new uint256[](2);
        expirationTimes[0] = block.timestamp + 7 days;
        expirationTimes[1] = block.timestamp + 7 days;
        
        vm.prank(sender);
        gigipay.createVoucherBatch{value: 10 ether}(
            VOUCHER4,
            codes,
            amounts,
            expirationTimes
        );
        
        // Claimer 1 claims CODE1
        vm.prank(claimer1);
        gigipay.claimVoucher(VOUCHER4, CODE1);
        
        // Claimer 2 tries to claim same CODE1 - should fail
        vm.prank(claimer2);
        vm.expectRevert(InvalidClaimCode.selector);
        gigipay.claimVoucher(VOUCHER4, CODE1);
        
        console.log("[SUCCESS] Prevented double claim of same code");
    }
    
    function test_WrongCodeInCampaign() public {
        // Create campaign
        string[] memory codes = new string[](2);
        codes[0] = CODE1;
        codes[1] = CODE2;
        
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 5 ether;
        amounts[1] = 5 ether;
        
        uint256[] memory expirationTimes = new uint256[](2);
        expirationTimes[0] = block.timestamp + 7 days;
        expirationTimes[1] = block.timestamp + 7 days;
        
        vm.prank(sender);
        gigipay.createVoucherBatch{value: 10 ether}(
            VOUCHER4,
            codes,
            amounts,
            expirationTimes
        );
        
        // Try to claim with wrong code
        vm.prank(claimer1);
        vm.expectRevert(InvalidClaimCode.selector);
        gigipay.claimVoucher(VOUCHER4, WRONG_CODE);
        
        console.log("[SUCCESS] Rejected wrong code in campaign");
    }
}