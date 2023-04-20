pragma circom 2.0.0; include "../circuits/dataProof.circom"; 

component main { public [ value ] } = DataProof(17, 6, 4);