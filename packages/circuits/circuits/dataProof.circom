pragma circom 2.1.0;

include "../../../node_modules/@unirep/circuits/circuits/hasher.circom";
include "../../../node_modules/@unirep/circuits/circuits/incrementalMerkleTree.circom";
include "../../../node_modules/@unirep/circuits/circuits/circomlib/circuits/comparators.circom";


template DataProof(STATE_TREE_DEPTH, FIELD_COUNT, SUM_FIELD_COUNT) {
    // State tree leaf: Identity & user state root
    signal input identity_secret;
    // State tree
    signal input state_tree_indexes[STATE_TREE_DEPTH];
    signal input state_tree_elements[STATE_TREE_DEPTH];
    signal input attester_id;
    signal input data[FIELD_COUNT];
    signal output state_tree_root;
    signal input epoch;

    // Prove values
    signal input value[SUM_FIELD_COUNT];

    /* 1. Check if user exists in the State Tree */

    // Compute state tree root
    signal leaf;
    (leaf, _, _) <== StateTreeLeaf(FIELD_COUNT)(data, identity_secret, attester_id, epoch);

    state_tree_root <== MerkleTreeInclusionProof(STATE_TREE_DEPTH)(leaf, state_tree_indexes, state_tree_elements);

    /* End of check 1 */

     /* 2. Check if user data more than given value */
    component get[SUM_FIELD_COUNT];
    for (var x = 0; x < SUM_FIELD_COUNT; x++) {
        get[x] = GreaterEqThan(252);
        get[x].in[0] <== data[x];
        get[x].in[1] <== value[x];
        get[x].out === 1;
    }
    /* End of check 2 */
}