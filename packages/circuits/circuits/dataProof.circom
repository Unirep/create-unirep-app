pragma circom 2.0.0;

include "../../../node_modules/@unirep/circuits/circuits/proveReputation.circom";
include "../../../node_modules/@unirep/circuits/circuits/circomlib/circuits/poseidon.circom";
include "../../../node_modules/@unirep/circuits/circuits/circomlib/circuits/mux1.circom";
include "../../../node_modules/@unirep/circuits/circuits/circomlib/circuits/gates.circom";
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
    component leaf_hasher = StateTreeLeaf(FIELD_COUNT);
    leaf_hasher.identity_secret <== identity_secret;
    leaf_hasher.attester_id <== attester_id;
    leaf_hasher.epoch <== epoch;
    for (var x = 0; x < FIELD_COUNT; x++) {
      leaf_hasher.data[x] <== data[x];
    }

    component merkletree = MerkleTreeInclusionProof(STATE_TREE_DEPTH);
    merkletree.leaf <== leaf_hasher.out;
    for (var i = 0; i < STATE_TREE_DEPTH; i++) {
        merkletree.path_index[i] <== state_tree_indexes[i];
        merkletree.path_elements[i] <== state_tree_elements[i];
    }
    state_tree_root <== merkletree.root;

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
