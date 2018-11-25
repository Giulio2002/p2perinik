contract MerkelTree {
    mapping (bytes32 => bool) public serials;
    mapping (bytes32 => bool) public roots;
    uint public tree_depth = 29;
    uint public no_leaves = 536870912;
    struct Mtree {
        uint cur;
        bytes32[536870912][30] leaves2;
    }

    Mtree public MT;

    event leafAdded(uint index);

    //Merkletree.append(com)
    function insert(bytes32 com) internal returns (bool res) {
        require (MT.cur != no_leaves - 1);
        MT.leaves2[0][MT.cur] = com;
        updateTree();
        leafAdded(MT.cur);
        MT.cur++;
   
        return true;
    }


    function getMerkelProof(uint index) constant returns (bytes32[29], uint[29]) {

        uint[29] memory address_bits;
        bytes32[29] memory merkelProof;

        for (uint i=0 ; i < tree_depth; i++) {
            address_bits[i] = index%2;
            if (index%2 == 0) {
                merkelProof[i] = getUniqueLeaf(MT.leaves2[i][index + 1],i);
            }
            else {
                merkelProof[i] = getUniqueLeaf(MT.leaves2[i][index - 1],i);
            }
            index = uint(index/2);
        }
        return(merkelProof, address_bits);   
    }
    
     function getSha256(bytes32 input, bytes32 sk) constant returns ( bytes32) { 
        return(sha256(input , sk)); 
    }

    function getUniqueLeaf(bytes32 leaf, uint depth) returns (bytes32) {
        if (leaf == 0x0) {
            for (uint i=0;i<depth;i++) {
                leaf = sha256(leaf, leaf);
            }
        }
        return(leaf);
    }
    
    function updateTree() internal returns(bytes32 root) {
        uint CurrentIndex = MT.cur;
        bytes32 leaf1;
        bytes32 leaf2;
        for (uint i=0 ; i < tree_depth; i++) {
            uint NextIndex = uint(CurrentIndex/2);
            if (CurrentIndex%2 == 0) {
                leaf1 =  MT.leaves2[i][CurrentIndex];
                leaf2 = getUniqueLeaf(MT.leaves2[i][CurrentIndex + 1], i);
            } else {
                leaf1 = getUniqueLeaf(MT.leaves2[i][CurrentIndex - 1], i);
                leaf2 =  MT.leaves2[i][CurrentIndex];
            }
            MT.leaves2[i+1][NextIndex] = (sha256( leaf1, leaf2));
            CurrentIndex = NextIndex;
        }
        return MT.leaves2[tree_depth][0];
    }
    
   
    function getLeaf(uint j,uint k) constant returns (bytes32 root) {
        root = MT.leaves2[j][k];
    }

    function getRoot() constant returns(bytes32 root) {
        root = MT.leaves2[tree_depth][0];
    }

}


contract Miximus is MerkelTree {
    mapping (bytes32 => bool) roots;
    mapping (bytes32 => bool) nullifiers;
    event Withdraw (address); 
    Verifier public zksnark_verify;
    function Miximus (address _zksnark_verify) {
        zksnark_verify = Verifier(_zksnark_verify);
    }

    function deposit (bytes32 leaf) payable  {
        require(msg.value == 1 ether);
        insert(leaf);
        roots[padZero(getRoot())] = true;
    }

    function withdraw (
            uint[2] a,
            uint[2] a_p,
            uint[2][2] b,
            uint[2] b_p,
            uint[2] c,
            uint[2] c_p,
            uint[2] h,
            uint[2] k,
            uint[] input
        ) returns (address) {
        address recipient  = nullifierToAddress(reverse(bytes32(input[2])));      
        bytes32 root = padZero(reverse(bytes32(input[0]))); //)merge253bitWords(input[0], input[1]);

        bytes32 nullifier = padZero(reverse(bytes32(input[2]))); //)merge253bitWords(input[2], input[3]);
        
        require(roots[root]);
        require(!nullifiers[nullifier]);

        require(zksnark_verify.verifyTx(a,a_p,b,b_p,c,c_p,h,k,input));
        nullifiers[nullifier] = true;
        
        uint fee = input[4];
        require(fee < 1 ether); 
        if (fee != 0 ) { 
            msg.sender.transfer(fee);
        }
        
        recipient.transfer(1 ether - fee);

        Withdraw(recipient); 
        return(recipient);
    }

    function isRoot(bytes32 root) constant returns(bool) {
        return(roots[root]);
    } 

    function nullifierToAddress(bytes32 source) returns(address) {
        bytes20[2] memory y = [bytes20(0), 0];
        assembly {
            mstore(y, source)
            mstore(add(y, 20), source)
        }
        //trace(source, y[0], y[1]);
        return(address(y[0]));
    }

    // libshark only allows 253 bit chunks in its output
    // to overcome this we merge the first 253 bits (left) with the remaining 3 bits
    // in the next variable (right)

    function merge253bitWords(uint left, uint right) returns(bytes32) {
        right = pad3bit(right);
        uint left_msb = uint(padZero(reverse(bytes32(left))));
        uint left_lsb = uint(getZero(reverse(bytes32(left))));
        right = right + left_lsb;
        uint res = left_msb + right; 
        return(bytes32(res));
    }


    // ensure that the 3 bits on the left is actually 3 bits.
    function pad3bit(uint input) constant returns(uint) {
        if (input == 0) 
            return 0;
        if (input == 1)
            return 4;
        if (input == 2)
            return 4;
        if (input == 3)
            return 6;
        return(input);
    }

    function getZero(bytes32 x) returns(bytes32) {
                 //0x1111111111111111111111113fdc3192693e28ff6aee95320075e4c26be03308
        return(x & 0x000000000000000000000000000000000000000000000000000000000000000F);
    }

    function padZero(bytes32 x) returns(bytes32) {
                 //0x1111111111111111111111113fdc3192693e28ff6aee95320075e4c26be03308
        return(x & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF0);
    }

    function reverseByte(uint a) public pure returns (uint) {
        uint c = 0xf070b030d0509010e060a020c0408000;

        return (( c >> ((a & 0xF)*8)) & 0xF0)   +  
               (( c >> (((a >> 4)&0xF)*8) + 4) & 0xF);
    }
    //flip endinaness
    function reverse(bytes32 a) public pure returns(bytes32) {
        uint r;
        uint i;
        uint b;
        for (i=0; i<32; i++) {
            b = (uint(a) >> ((31-i)*8)) & 0xff;
            b = reverseByte(b);
            r += b << (i*8);
        }
        return bytes32(r);
    }

}
library Pairing {
    struct G1Point {
        uint X;
        uint Y;
    }
    // Encoding of field elements is: X[0] * z + X[1]
    struct G2Point {
        uint[2] X;
        uint[2] Y;
    }
    /// @return the generator of G1
    function P1() internal returns (G1Point) {
        return G1Point(1, 2);
    }
    /// @return the generator of G2
    function P2() internal returns (G2Point) {
        return G2Point(
            [11559732032986387107991004021392285783925812861821192530917403151452391805634,
             10857046999023057135944570762232829481370756359578518086990519993285655852781],
            [4082367875863433681332203403145435568316851327593401208105741076214120093531,
             8495653923123431417604973247489272438418190587263600148770280649306958101930]
        );
    }
    /// @return the negation of p, i.e. p.add(p.negate()) should be zero.
    function negate(G1Point p) internal returns (G1Point) {
        // The prime q in the base field F_q for G1
        uint q = 21888242871839275222246405745257275088696311157297823662689037894645226208583;
        if (p.X == 0 && p.Y == 0)
            return G1Point(0, 0);
        return G1Point(p.X, q - (p.Y % q));
    }
    /// @return the sum of two points of G1
    function add(G1Point p1, G1Point p2) internal returns (G1Point r) {
        uint[4] memory input;
        input[0] = p1.X;
        input[1] = p1.Y;
        input[2] = p2.X;
        input[3] = p2.Y;
        bool success;
        assembly {
            success := call(sub(gas, 2000), 6, 0, input, 0xc0, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid }
        }
        require(success);
    }
    /// @return the product of a point on G1 and a scalar, i.e.
    /// p == p.mul(1) and p.add(p) == p.mul(2) for all points p.
    function mul(G1Point p, uint s) internal returns (G1Point r) {
        uint[3] memory input;
        input[0] = p.X;
        input[1] = p.Y;
        input[2] = s;
        bool success;
        assembly {
            success := call(sub(gas, 2000), 7, 0, input, 0x80, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid }
        }
        require (success);
    }
    /// @return the result of computing the pairing check
    /// e(p1[0], p2[0]) *  .... * e(p1[n], p2[n]) == 1
    /// For example pairing([P1(), P1().negate()], [P2(), P2()]) should
    /// return true.
    function pairing(G1Point[] p1, G2Point[] p2) internal returns (bool) {
        require(p1.length == p2.length);
        uint elements = p1.length;
        uint inputSize = elements * 6;
        uint[] memory input = new uint[](inputSize);
        for (uint i = 0; i < elements; i++)
        {
            input[i * 6 + 0] = p1[i].X;
            input[i * 6 + 1] = p1[i].Y;
            input[i * 6 + 2] = p2[i].X[0];
            input[i * 6 + 3] = p2[i].X[1];
            input[i * 6 + 4] = p2[i].Y[0];
            input[i * 6 + 5] = p2[i].Y[1];
        }
        uint[1] memory out;
        bool success;
        assembly {
            success := call(sub(gas, 2000), 8, 0, add(input, 0x20), mul(inputSize, 0x20), out, 0x20)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid }
        }
        require(success);
        return out[0] != 0;
    }
    /// Convenience method for a pairing check for two pairs.
    function pairingProd2(G1Point a1, G2Point a2, G1Point b1, G2Point b2) internal returns (bool) {
        G1Point[] memory p1 = new G1Point[](2);
        G2Point[] memory p2 = new G2Point[](2);
        p1[0] = a1;
        p1[1] = b1;
        p2[0] = a2;
        p2[1] = b2;
        return pairing(p1, p2);
    }
    /// Convenience method for a pairing check for three pairs.
    function pairingProd3(
            G1Point a1, G2Point a2,
            G1Point b1, G2Point b2,
            G1Point c1, G2Point c2
    ) internal returns (bool) {
        G1Point[] memory p1 = new G1Point[](3);
        G2Point[] memory p2 = new G2Point[](3);
        p1[0] = a1;
        p1[1] = b1;
        p1[2] = c1;
        p2[0] = a2;
        p2[1] = b2;
        p2[2] = c2;
        return pairing(p1, p2);
    }
    /// Convenience method for a pairing check for four pairs.
    function pairingProd4(
            G1Point a1, G2Point a2,
            G1Point b1, G2Point b2,
            G1Point c1, G2Point c2,
            G1Point d1, G2Point d2
    ) internal returns (bool) {
        G1Point[] memory p1 = new G1Point[](4);
        G2Point[] memory p2 = new G2Point[](4);
        p1[0] = a1;
        p1[1] = b1;
        p1[2] = c1;
        p1[3] = d1;
        p2[0] = a2;
        p2[1] = b2;
        p2[2] = c2;
        p2[3] = d2;
        return pairing(p1, p2);
    }
}

contract Verifier {
    using Pairing for *;
    uint i = 0; //IC parameater add counter.
    struct VerifyingKey {
        Pairing.G2Point A;
        Pairing.G1Point B;
        Pairing.G2Point C;
        Pairing.G2Point gamma;
        Pairing.G1Point gammaBeta1;
        Pairing.G2Point gammaBeta2;
        Pairing.G2Point Z;
        Pairing.G1Point[] IC;
    }
    struct Proof {
        Pairing.G1Point A;
        Pairing.G1Point A_p;
        Pairing.G2Point B;
        Pairing.G1Point B_p;
        Pairing.G1Point C;
        Pairing.G1Point C_p;
        Pairing.G1Point K;
        Pairing.G1Point H;
    }
    VerifyingKey verifyKey;
    function Verifier (uint[2] A1, uint[2] A2, uint[2] B, uint[2] C1, uint[2] C2, 
                       uint[2] gamma1, uint[2] gamma2, uint[2] gammaBeta1, 
                       uint[2] gammaBeta2_1, uint[2] gammaBeta2_2, uint[2] Z1, uint[2] Z2,
                       uint[] input) {
        verifyKey.A = Pairing.G2Point(A1,A2);
        verifyKey.B = Pairing.G1Point(B[0], B[1]);
        verifyKey.C = Pairing.G2Point(C1, C2);
        verifyKey.gamma = Pairing.G2Point(gamma1, gamma2);

        verifyKey.gammaBeta1 = Pairing.G1Point(gammaBeta1[0], gammaBeta1[1]);
        verifyKey.gammaBeta2 = Pairing.G2Point(gammaBeta2_1, gammaBeta2_2);
        verifyKey.Z = Pairing.G2Point(Z1,Z2);
        //addIC(input);
        //verifyKey.IC = new Pairing.G1Point[](1);
        //for (uint i = 0; i < input.length; i+=2)
        //    verifyKey.IC.push(Pairing.G1Point(input[i], input[i+1]));
        //    verifyKey.IC.push(Pairing.G1Point(input[i][0], input[i][1]));  
        //verifyKey.IC.push(Pairing.G1Point(input[0], input[1])); 

        while (verifyKey.IC.length != input.length/2) {
            verifyKey.IC.push(Pairing.G1Point(input[i], input[i+1]));
            i += 2;
        }

    }

   function getIC(uint i) returns(uint) {
       return(verifyKey.IC[i].X);
   }

   function getICLen () returns (uint) { 
        return(verifyKey.IC.length);
   } 

   function verify(uint[] input, Proof proof) internal returns (uint) {
        VerifyingKey memory vk = verifyKey;
        require(input.length + 1 == vk.IC.length);


        // Compute the linear combination vk_x
        Pairing.G1Point memory vk_x = Pairing.G1Point(0, 0);
        for (uint i = 0; i < input.length; i++)
            vk_x = Pairing.add(vk_x, Pairing.mul(vk.IC[i + 1], input[i]));
        vk_x = Pairing.add(vk_x, vk.IC[0]);

        if (!Pairing.pairingProd2(proof.A, vk.A, Pairing.negate(proof.A_p), Pairing.P2())) return 1;
        if (!Pairing.pairingProd2(vk.B, proof.B, Pairing.negate(proof.B_p), Pairing.P2())) return 2;
        if (!Pairing.pairingProd2(proof.C, vk.C, Pairing.negate(proof.C_p), Pairing.P2())) return 3;
        if (!Pairing.pairingProd3(
            proof.K, vk.gamma,
            Pairing.negate(Pairing.add(vk_x, Pairing.add(proof.A, proof.C))), vk.gammaBeta2,
            Pairing.negate(vk.gammaBeta1), proof.B
        )) return 4;
        if (!Pairing.pairingProd3(
                Pairing.add(vk_x, proof.A), proof.B,
                Pairing.negate(proof.H), vk.Z,
                Pairing.negate(proof.C), Pairing.P2()
        )) return 5; 
        return 0;
    }
    event Verified(string);
    function verifyTx(
            uint[2] a,
            uint[2] a_p,
            uint[2][2] b,
            uint[2] b_p,
            uint[2] c,
            uint[2] c_p,
            uint[2] h,
            uint[2] k,
            uint[] input
        ) returns (bool) {
        Proof memory proof;
        proof.A = Pairing.G1Point(a[0], a[1]);
        proof.A_p = Pairing.G1Point(a_p[0], a_p[1]);
        proof.B = Pairing.G2Point([b[0][0], b[0][1]], [b[1][0], b[1][1]]);
        proof.B_p = Pairing.G1Point(b_p[0], b_p[1]);
        proof.C = Pairing.G1Point(c[0], c[1]);
        proof.C_p = Pairing.G1Point(c_p[0], c_p[1]);
        proof.H = Pairing.G1Point(h[0], h[1]);
        proof.K = Pairing.G1Point(k[0], k[1]);
        uint[] memory inputValues = new uint[](input.length);
        for(uint i = 0; i < input.length; i++){
            inputValues[i] = input[i];
        }
        //uint res = verify(inputValues, proof);
        if (verify(inputValues, proof) == 0) {
            Verified("Transaction successfully verified.");
            return true;
        } else {
            return false;
        }
        //return(res);
    } 
}
