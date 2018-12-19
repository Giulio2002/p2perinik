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
        EncryptedAddress memory entry = EncryptedAddress(encryptedAddress, specialHash);
        encryptedAddresses.push(entry);
    }
    
    function withdraw(bytes memory passphrase) public {
        address payable recipient = address(uint160(decrypt(passphrase)));
        if (recipient != address(0))
            recipient.transfer(1 ether); 
    }
    
    function isEntryPresent(bytes memory encryptedAddress) view private returns(bool){
        for (uint256 i = 0; i < encryptedAddresses.length; i++) {
            if (bytesToBytes32(abi.encode(encryptedAddresses[i].encryptedAddress)) == bytesToBytes32(abi.encode(encryptedAddress)))
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
}