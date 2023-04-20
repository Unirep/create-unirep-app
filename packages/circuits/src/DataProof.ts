import { SnarkProof } from '@unirep/utils'
import { BigNumberish } from '@ethersproject/bignumber'
import { BaseProof, Prover } from '@unirep/circuits'

/**
 * The data proof structure that helps to query the public signals
 */
export class DataProof extends BaseProof {
    readonly idx = {
        stateTreeRoot: 0,
        value: [1, 5],
    }
    public stateTreeRoot: BigNumberish
    public value: BigNumberish[]

    /**
     * @param _publicSignals The public signals of the data proof that can be verified by the prover
     * @param _proof The proof that can be verified by the prover
     * @param prover The prover that can verify the public signals and the proof
     */
    constructor(
        _publicSignals: BigNumberish[],
        _proof: SnarkProof,
        prover?: Prover
    ) {
        super(_publicSignals, _proof, prover)
        this.stateTreeRoot = _publicSignals[this.idx.stateTreeRoot]
        this.value = []
        for (let i = this.idx.value[0]; i < this.idx.value[1]; i++) {
            this.value.push(_publicSignals[i])
        }
        ;(this as any).circuit = 'dataProof'
    }
}
