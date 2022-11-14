// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import {Unirep} from "@unirep/contracts/Unirep.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract UnirepApp {
    Unirep public unirep;
    uint256 public immutable epochLength;
    uint160 public immutable attesterId;

    constructor(Unirep _unirep, uint256 _epochLength) {
        // set unirep address
        unirep = _unirep;

        // sign up as an attester
        unirep.attesterSignUp(_epochLength);
        epochLength = _epochLength;
        attesterId = uint160(address(this));
    }

    // sign up users in this app
    function userSignUp(uint256[] memory publicSignals, uint256[8] memory proof)
        public
    {
        unirep.userSignUp(publicSignals, proof);
    }

    // submit attestations
    function submitAttestation(
        uint256 targetEpoch,
        uint256 epochKey,
        uint256 posRep,
        uint256 negRep,
        uint256 graffiti
    ) public {
        unirep.submitAttestation(
            targetEpoch,
            epochKey,
            posRep,
            negRep,
            graffiti
        );
    }

    // process attestations
    function buildHashchain() public {
        uint256 epoch = unirep.attesterCurrentEpoch(attesterId);
        unirep.buildHashchain(attesterId, epoch);
    }

    function processHashchain(
        uint256[] memory publicSignals,
        uint256[8] memory proof
    ) public {
        unirep.processHashchain(publicSignals, proof);
    }

    function userStateTransition(
        uint256[] memory publicSignals,
        uint256[8] memory proof
    ) public {
        unirep.userStateTransition(publicSignals, proof);
    }

    function currentEpoch() public view returns (uint256) {
        return unirep.attesterCurrentEpoch(attesterId);
    }
}
