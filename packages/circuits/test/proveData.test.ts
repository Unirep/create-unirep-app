import { expect } from 'chai'
import * as utils from '@unirep/utils'
import { Identity } from '@semaphore-protocol/identity'
import { Circuit, CircuitConfig } from '@unirep/circuits'
import { defaultProver } from '../provers/defaultProver'

const { FIELD_COUNT, SUM_FIELD_COUNT, STATE_TREE_DEPTH, REPL_NONCE_BITS } =
    CircuitConfig.default

const REPL_FIELD_COUNT = FIELD_COUNT - SUM_FIELD_COUNT

const circuit = 'dataProof'

const genCircuitInput = (config: {
    id: Identity
    epoch: number
    chainId: number
    attesterId: number | bigint
    sumField?: (bigint | number)[]
    replField?: (bigint | number)[]
    proveValues?: (bigint | number)[]
}) => {
    const { id, epoch, attesterId, sumField, replField, proveValues, chainId } =
        Object.assign(
            {
                sumField: [],
                replField: [],
                proveValues: [],
            },
            config
        )

    const startBalance = [
        ...sumField,
        ...Array(SUM_FIELD_COUNT - sumField.length).fill(0),
        ...replField,
        ...Array(REPL_FIELD_COUNT - replField.length).fill(0),
    ]
    // Global state tree
    const stateTree = new utils.IncrementalMerkleTree(STATE_TREE_DEPTH)
    const hashedLeaf = utils.genStateTreeLeaf(
        id.secret,
        BigInt(attesterId),
        epoch,
        startBalance as any,
        chainId
    )
    stateTree.insert(hashedLeaf)
    const stateTreeProof = stateTree.createProof(0) // if there is only one GST leaf, the index is 0

    const value = [
        ...proveValues,
        Array(FIELD_COUNT - proveValues.length).fill(0),
    ]

    const circuitInputs = {
        identity_secret: id.secret,
        state_tree_indices: stateTreeProof.pathIndices,
        state_tree_elements: stateTreeProof.siblings,
        data: startBalance,
        epoch: epoch,
        attester_id: attesterId,
        chain_id: chainId,
        value: value,
    }
    return utils.stringifyBigInts(circuitInputs)
}

const genProofAndVerify = async (
    circuit: Circuit | string,
    circuitInputs: any
) => {
    const startTime = new Date().getTime()
    const { proof, publicSignals } =
        await defaultProver.genProofAndPublicSignals(circuit, circuitInputs)
    const endTime = new Date().getTime()
    console.log(
        `Gen Proof time: ${endTime - startTime} ms (${Math.floor(
            (endTime - startTime) / 1000
        )} s)`
    )
    const isValid = await defaultProver.verifyProof(
        circuit,
        publicSignals,
        proof
    )
    return { isValid, proof, publicSignals }
}

const genReplField = (values: (number | bigint)[]) => {
    const replFields: (number | bigint)[] = []
    for (let i = 0; i < values.length; i++) {
        let dataUpperBits = BigInt(values[i])
        let indexLowerBits = BigInt(i)
        let replField =
            (dataUpperBits << BigInt(REPL_NONCE_BITS)) | indexLowerBits
        replFields.push(replField)
    }
    return replFields
}

describe('Prove data in Unirep App', function () {
    this.timeout(300000)

    const chainId = 31337
    it('should generate a data proof', async () => {
        const id = new Identity()
        const epoch = 20
        const attesterId = BigInt(219090124810)
        const circuitInputs = genCircuitInput({
            id,
            epoch,
            attesterId,
            chainId,
        })
        const { isValid } = await genProofAndVerify(circuit, circuitInputs)
        expect(isValid).to.be.true
    })

    it('should generate a data proof with values for Addition field', async () => {
        const id = new Identity()
        const epoch = 20
        const attesterId = BigInt(219090124810)
        const sumField = Array(SUM_FIELD_COUNT).fill(5)
        const replData = Array(REPL_FIELD_COUNT).fill(4)
        const replField = genReplField(replData)
        const proveValues = Array(FIELD_COUNT).fill(4)
        const circuitInputs = genCircuitInput({
            id,
            epoch,
            chainId,
            attesterId,
            sumField,
            replField,
            proveValues,
        })
        const { isValid } = await genProofAndVerify(circuit, circuitInputs)
        expect(isValid).to.be.true
    })

    it('should not generate a data proof with invalid values for Addition field', async () => {
        const id = new Identity()
        const epoch = 20
        const attesterId = BigInt(219090124810)
        const sumField = Array(SUM_FIELD_COUNT).fill(4)
        const replData = Array(REPL_FIELD_COUNT).fill(5)
        const replField = genReplField(replData)
        const proveValues = Array(FIELD_COUNT).fill(5)
        const circuitInputs = genCircuitInput({
            id,
            epoch,
            chainId,
            attesterId,
            sumField,
            replField,
            proveValues,
        })
        await new Promise<void>((rs, rj) => {
            genProofAndVerify(circuit, circuitInputs)
                .then(() => rj())
                .catch(() => rs())
        })
    })

    it('should generate a data proof with values for Replacement field', async () => {
        const id = new Identity()
        const epoch = 20
        const attesterId = BigInt(219090124810)
        const sumField = Array(SUM_FIELD_COUNT).fill(5)
        const replData = Array(REPL_FIELD_COUNT).fill(5)
        const replField = genReplField(replData)
        const proveValues = Array(FIELD_COUNT).fill(5)
        const circuitInputs = genCircuitInput({
            id,
            epoch,
            chainId,
            attesterId,
            sumField,
            replField,
            proveValues,
        })
        const { isValid } = await genProofAndVerify(circuit, circuitInputs)
        expect(isValid).to.be.true
    })

    it('should not generate a data proof with invalid values for Replacement field', async () => {
        const id = new Identity()
        const epoch = 20
        const attesterId = BigInt(219090124810)
        const sumField = Array(SUM_FIELD_COUNT).fill(5)
        const replData = Array(REPL_FIELD_COUNT).fill(4)
        const replField = genReplField(replData)
        const proveValues = Array(FIELD_COUNT).fill(5)
        const circuitInputs = genCircuitInput({
            id,
            epoch,
            chainId,
            attesterId,
            sumField,
            replField,
            proveValues,
        })
        await new Promise<void>((rs, rj) => {
            genProofAndVerify(circuit, circuitInputs)
                .then(() => rj())
                .catch(() => rs())
        })
    })
})
