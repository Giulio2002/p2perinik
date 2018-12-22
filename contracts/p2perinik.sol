pragma solidity ^0.5.1;
 
contract P2Perinik {
    
    struct EncryptedAddress {
        bytes encryptedAddress;
        bytes32 specialHash;
    }
    
    EncryptedAddress[] public encryptedAddresses; 
    event debug(address);
    
    function deposit(bytes memory encryptedAddress, bytes32 specialHash) public payable {
        require(!isEntryPresent(encryptedAddress));
        require(msg.value == 1 ether);
        EncryptedAddress memory entry = EncryptedAddress(new bytes(0), bytes32(0));
        encryptedAddresses.push(entry);
        encryptedAddresses[encryptedAddresses.length - 1].encryptedAddress = encryptedAddress;
        encryptedAddresses[encryptedAddresses.length - 1].specialHash = specialHash;
    }
    
    function withdraw(bytes memory passphrase) public {
        address payable recipient = address(uint160(decrypt(passphrase)));
        if (recipient != address(0))
            recipient.transfer(1 ether); 
    }
    
    function isEntryPresent(bytes memory encryptedAddress) view private returns(bool){
        for (uint256 i = 0; i < encryptedAddresses.length; i++) {
            if (equalStorage(encryptedAddresses[i].encryptedAddress, encryptedAddress))
                return true;
        }
        return false;
    }
    
    function bytesToBytes32(bytes memory source) pure private returns (bytes32 result) {
        assembly {
            result := mload(add(source, 32))
        }
    }
    
    function decrypt(bytes memory passphrase)  private returns(address) {
        for (uint256 i = 0; i < encryptedAddresses.length; i++) {
            address decrypted = tryDecrypt(encryptedAddresses[i].encryptedAddress, passphrase);
            if (decrypted != address(0)) {
              if(decrypted != msg.sender) continue;
              if(!verifySpecialHash(encryptedAddresses[i].encryptedAddress, passphrase, decrypted ,encryptedAddresses[i].specialHash)) continue;
              removeEncryptedAddress(i);
              return decrypted;  
            }
        }
        
        return address(0);
    }
    
    function tryDecrypt(bytes memory encryptedAddress, bytes memory passphrase) pure private returns(address) {
        for (uint256 i = 0; i < encryptedAddress.length; i++) {
            encryptedAddress[i] = byte(uint8(uint8(encryptedAddress[i]) - uint8(passphrase[i])));
        }
        return bytesToAddress(encryptedAddress);
    }
    
    function bytesToAddress (bytes memory b) pure private returns (address) {
        uint result = 0;
        for (uint i = 0; i < b.length; i++) {
            uint c = uint8(b[i]);
            if (c >= 48 && c <= 57) {
                result = result * 16 + (c - 48);
            } else if(c >= 65 && c<= 90) {
                result = result * 16 + (c - 55);
            } else if(c >= 97 && c<= 122) {
                result = result * 16 + (c - 87);
            } else {
                return address(0);
            }
        }
        return address(result);
    }
    
    function toBytes(string memory source) public pure returns (bytes memory b) {
        b = bytes(source);
    }
    
    function generateSpecialHash(bytes memory encryptedAddress, address recipient, uint8 specialNumber) public pure returns(bytes32) {
        return keccak256(abi.encode(encryptedAddress ,recipient, specialNumber));
    }
    
    function removeEncryptedAddress(uint index) private {
        for (uint i = index; i<encryptedAddresses.length-1; i++){
            encryptedAddresses[i] = encryptedAddresses[i+1];
        }
        delete encryptedAddresses[encryptedAddresses.length-1];
        encryptedAddresses.length--;
    }
    
    function verifySpecialHash (bytes memory encryptedAddress,bytes memory passphrase, address decryptedAddress, bytes32 specialHash) private pure returns(bool) {
        for (uint256 i = 0;i < passphrase.length;i++) {
            if (keccak256(abi.encode(encryptedAddress, decryptedAddress, uint8(passphrase[i]))) == specialHash)
                return true;
        }
        return false;
    }
    
    function equalStorage(bytes storage _preBytes, bytes memory _postBytes) internal view returns (bool) {
        bool success = true;

        assembly {
            // we know _preBytes_offset is 0
            let fslot := sload(_preBytes_slot)
            // Decode the length of the stored array like in concatStorage().
            let slength := div(and(fslot, sub(mul(0x100, iszero(and(fslot, 1))), 1)), 2)
            let mlength := mload(_postBytes)

            // if lengths don't match the arrays are not equal
            switch eq(slength, mlength)
            case 1 {
                // slength can contain both the length and contents of the array
                // if length < 32 bytes so let's prepare for that
                // v. http://solidity.readthedocs.io/en/latest/miscellaneous.html#layout-of-state-variables-in-storage
                if iszero(iszero(slength)) {
                    switch lt(slength, 32)
                    case 1 {
                        // blank the last byte which is the length
                        fslot := mul(div(fslot, 0x100), 0x100)

                        if iszero(eq(fslot, mload(add(_postBytes, 0x20)))) {
                            // unsuccess:
                            success := 0
                        }
                    }
                    default {
                        // cb is a circuit breaker in the for loop since there's
                        //  no said feature for inline assembly loops
                        // cb = 1 - don't breaker
                        // cb = 0 - break
                        let cb := 1

                        // get the keccak hash to get the contents of the array
                        mstore(0x0, _preBytes_slot)
                        let sc := keccak256(0x0, 0x20)

                        let mc := add(_postBytes, 0x20)
                        let end := add(mc, mlength)

                        // the next line is the loop condition:
                        // while(uint(mc < end) + cb == 2)
                        for {} eq(add(lt(mc, end), cb), 2) {
                            sc := add(sc, 1)
                            mc := add(mc, 0x20)
                        } {
                            if iszero(eq(sload(sc), mload(mc))) {
                                // unsuccess:
                                success := 0
                                cb := 0
                            }
                        }
                    }
                }
            }
            default {
                // unsuccess:
                success := 0
            }
        }

        return success;
    }
}