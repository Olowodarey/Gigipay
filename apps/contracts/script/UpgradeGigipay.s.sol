// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Script, console} from "forge-std/Script.sol";
import {Gigipay} from "../src/Gigipay.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @notice Upgrades an existing Gigipay proxy to a new implementation.
 *
 * Required env vars:
 *   PRIVATE_KEY       — deployer private key (must hold DEFAULT_ADMIN_ROLE on the proxy)
 *   PROXY_ADDRESS     — the existing proxy address to upgrade
 *
 * Usage (Celo):
 *   forge script script/UpgradeGigipay.s.sol:UpgradeGigipay \
 *     --rpc-url https://forno.celo.org \
 *     --private-key $PRIVATE_KEY \
 *     --broadcast -vvvv
 *
 * Usage (Base):
 *   forge script script/UpgradeGigipay.s.sol:UpgradeGigipay \
 *     --rpc-url https://mainnet.base.org \
 *     --private-key $PRIVATE_KEY \
 *     --broadcast -vvvv
 */
contract UpgradeGigipay is Script {
    function run() public {
        address proxyAddress = vm.envAddress("PROXY_ADDRESS");

        vm.startBroadcast();

        // 1. Deploy the new implementation
        Gigipay newImplementation = new Gigipay();
        console.log("New implementation deployed at:", address(newImplementation));

        // 2. Upgrade the proxy to point to the new implementation
        //    ERC1967Proxy exposes upgradeToAndCall via the UUPSUpgradeable interface.
        //    We call it through the proxy using the admin account.
        Gigipay proxy = Gigipay(payable(proxyAddress));
        proxy.upgradeToAndCall(address(newImplementation), "");
        console.log("Proxy upgraded at:", proxyAddress);
        console.log("New implementation:", address(newImplementation));

        vm.stopBroadcast();
    }
}
