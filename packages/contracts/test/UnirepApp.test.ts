//@ts-ignore
import { ethers } from 'hardhat'
import { deployUnirep } from '@unirep/contracts/deploy'
import { genRandomSalt, ZkIdentity, stringifyBigInts } from '@unirep/utils'
import { schema, UserState } from '@unirep/core'
import { SQLiteConnector } from 'anondb/node'
import { Circuit, BuildOrderedTree } from '@unirep/circuits'
import { defaultProver as prover } from '@unirep/circuits/provers/defaultProver'

async function genUserState(id, app) {
  // generate a user state
  const db = await SQLiteConnector.create(schema, ':memory:')
  const unirepAddress = await app.unirep()
  const attesterId = BigInt(app.address)
  const userState = new UserState({
    db,
    prover,
    unirepAddress,
    provider: ethers.provider,
    attesterId,
  }, id)
  await userState.sync.start()
  await userState.waitForSync()
  return userState
}

describe('Unirep App', function () {
  let unirep
  let app

  // epoch length
  const epochLength = 30
  let startTime = 0
  // generate random user id
  const id = new ZkIdentity()
  // graffiti preimage
  const graffitiPreImage = genRandomSalt()

  it('deployment', async function () {
    const [deployer] = await ethers.getSigners()
    unirep = await deployUnirep(deployer)
    const App = await ethers.getContractFactory('UnirepApp')
    app = await App.deploy(unirep.address, epochLength)
    await app.deployed()
    startTime = (await unirep.attesterStartTimestamp(app.address)).toNumber()
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
    await unirep.verifyEpochKeyProof(publicSignals, proof).then((t) => t.wait())

    const field = 0
    const val = 10
    await app
      .submitAttestation(epochKey, epoch, field, val)
      .then((t) => t.wait())
    userState.sync.stop()
  })

  it('(attester/relayer) process attestations', async () => {
    const userState = await genUserState(id, app)
    const epoch = await userState.sync.loadCurrentEpoch()
    await ethers.provider.send('evm_increaseTime', [epochLength])
    await ethers.provider.send('evm_mine', [])

    const preimages = await userState.sync.genEpochTreePreimages(epoch)
    const { circuitInputs } = BuildOrderedTree.buildInputsForLeaves(preimages)
    const r = await prover.genProofAndPublicSignals(
      Circuit.buildOrderedTree,
      stringifyBigInts(circuitInputs)
    )
    const { publicSignals, proof } = new BuildOrderedTree(
      r.publicSignals,
      r.proof,
      prover
    )
    await unirep
      .sealEpoch(epoch, app.address, publicSignals, proof)
      .then((t) => t.wait())
    userState.sync.stop()
  })

  it('user state transition', async () => {
    const newEpoch = await unirep.attesterCurrentEpoch(app.address)
    const userState = await genUserState(id, app)
    const { publicSignals, proof } =
      await userState.genUserStateTransitionProof({
        toEpoch: newEpoch.toNumber(),
      })
    await unirep.userStateTransition(publicSignals, proof).then((t) => t.wait())
    userState.sync.stop()
  })

  it('reputation proof', async () => {
    const userState = await genUserState(id, app)

    const { publicSignals, proof } = await userState.genProveReputationProof({
      epkNonce: 0,
      minRep: 4,
    })
    await unirep
      .verifyReputationProof(publicSignals, proof)
      .then((t) => t.wait())
    userState.sync.stop()
  })
})
