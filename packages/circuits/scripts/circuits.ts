import { CircuitConfig } from '@unirep/circuits'
const { STATE_TREE_DEPTH, FIELD_COUNT, SUM_FIELD_COUNT } = CircuitConfig.default

export const ptauName = 'powersOfTau28_hez_final_18.ptau'

export const circuitContents = {
    dataProof: `pragma circom 2.0.0; include "../circuits/dataProof.circom"; \n\ncomponent main { public [ value ] } = DataProof(${STATE_TREE_DEPTH}, ${FIELD_COUNT}, ${SUM_FIELD_COUNT});`,
}
