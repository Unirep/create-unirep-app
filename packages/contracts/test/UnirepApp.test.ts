//@ts-ignore
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { deployUnirep } from '@unirep/contracts/deploy'
import { stringifyBigInts } from '@unirep/utils'
import { schema, UserState } from '@unirep/core'
import { SQLiteConnector } from 'anondb/node'
import { DataProof } from '@unirep-app/circuits'
import defaultConfig from '@unirep/circuits/config'
import { Identity } from '@semaphore-protocol/identity'
const { SUM_FIELD_COUNT } = defaultConfig
import { defaultProver as prover } from '@unirep-app/circuits/provers/defaultProver'

async function genUserState(id, app) {
    // generate a user state
    const db = await SQLiteConnector.create(schema, ':memory:')
    const unirepAddress = await app.unirep()
    const attesterId = BigInt(app.address)
    const userState = new UserState(
        {
            db,
            prover,
            unirepAddress,
            provider: ethers.provider,
            attesterId,
        },
        id
    )
    await userState.sync.start()
    await userState.waitForSync()
    return userState
}

describe('Unirep App', function () {
    let unirep
    let app

    // epoch length
    const epochLength = 300
    // generate random user id
    const id = new Identity()

    it('deployment', async function () {
        const [deployer] = await ethers.getSigners()
        unirep = await deployUnirep(deployer)
        const verifierF = await ethers.getContractFactory('DataProofVerifier')
        const verifier = await verifierF.deploy()
        await verifier.deployed()
        const App = await ethers.getContractFactory('UnirepApp')
        app = await App.deploy(unirep.address, verifier.address, epochLength)
        await app.deployed()
    })

    it('user sign up', async () => {
        const userState = await genUserState(id, app)

        // generate
        const { publicSignals, proof } = await userState.genUserSignUpProof()
        await app.userSignUp(publicSignals, proof).then((t) => t.wait())
        userState.sync.stop()
    })

    it('submit attestations', async () => {
        const userState = await genUserState(id, app)

        const nonce = 0
        const { publicSignals, proof, epochKey, epoch } =
            await userState.genEpochKeyProof({ nonce })
        await unirep
            .verifyEpochKeyProof(publicSignals, proof)
            .then((t) => t.wait())

        const field = 0
        const val = 10
        await app
            .submitAttestation(epochKey, epoch, field, val)
            .then((t) => t.wait())
        userState.sync.stop()
    })

    it('user state transition', async () => {
        await ethers.provider.send('evm_increaseTime', [epochLength])
        await ethers.provider.send('evm_mine', [])

        const newEpoch = await unirep.attesterCurrentEpoch(app.address)
        const userState = await genUserState(id, app)
        const { publicSignals, proof } =
            await userState.genUserStateTransitionProof({
                toEpoch: newEpoch,
            })
        await unirep
            .userStateTransition(publicSignals, proof)
            .then((t) => t.wait())
        userState.sync.stop()
    })

    it('data proof', async () => {
        const userState = await genUserState(id, app)
        const epoch = await userState.sync.loadCurrentEpoch()
        const stateTree = await userState.sync.genStateTree(epoch)
        const index = await userState.latestStateTreeLeafIndex(epoch)
        const stateTreeProof = stateTree.createProof(index)
        const attesterId = app.address
        const data = await userState.getProvableData()
        const value = Array(SUM_FIELD_COUNT).fill(0)
        const circuitInputs = stringifyBigInts({
            identity_secret: id.secret,
            state_tree_indexes: stateTreeProof.pathIndices,
            state_tree_elements: stateTreeProof.siblings,
            data: data,
            epoch: epoch,
            attester_id: attesterId,
            value: value,
        })
        const p = await prover.genProofAndPublicSignals(
            'dataProof',
            circuitInputs
        )
        const dataProof = new DataProof(p.publicSignals, p.proof, prover)
        const isValid = await app.verifyDataProof(
            dataProof.publicSignals,
            dataProof.proof
        )
        expect(isValid).to.be.true
        userState.sync.stop()
    })
})
