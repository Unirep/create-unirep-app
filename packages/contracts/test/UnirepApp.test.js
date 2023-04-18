const { expect } = require("chai")
const { ethers } = require("hardhat")
const { deployUnirep } = require("@unirep/contracts/deploy")
const { genRandomSalt, hashOne } = require("@unirep/utils")
const { Identity } = require("@semaphore-protocol/identity")
const { schema, UserState } = require("@unirep/core")
const { DB, SQLiteConnector } = require('anondb/node')
const { Unirep } = require("@unirep/contracts")

const { defaultProver: prover } = require('@unirep/circuits/provers/defaultProver')

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
        _id: id,
    })
    await userState.start()
    await userState.waitForSync()
    return userState
}

describe("Unirep App", function () {
    this.timeout(200000)
    let unirep
    let app

    // epoch length
    const epochLength = 30
    let startTime = 0
    // generate random user id
    const id = new Identity()
    // graffiti preimage
    const graffitiPreImage = genRandomSalt()

    it("deployment", async function () {
        const [deployer] = await ethers.getSigners();
        unirep = await deployUnirep(deployer)
        const App = await ethers.getContractFactory("UnirepApp");
        app = await App.deploy(unirep.address, epochLength);
        await app.deployed()
        startTime = (await unirep.attesterStartTimestamp(app.address)).toNumber()
    });

    it("user sign up", async () => {
        const userState = await genUserState(id, app);

        // generate
        const { publicSignals, proof } = await userState.genUserSignUpProof()
        await app.userSignUp(publicSignals, proof)
            .then(t => t.wait())
    })

    it("submit attestations", async () => {
        const userState = await genUserState(id, app);

        const nonce = 0
        const { publicSignals, proof, epochKey, epoch } = await userState.genEpochKeyProof({ nonce })
        await unirep.verifyEpochKeyProof(publicSignals, proof).then(t => t.wait())

        const posRep = 5
        const negRep = 0
        const graffiti = hashOne(graffitiPreImage) >> BigInt(userState.sync.settings.replNonceBits)
        await app.submitManyAttestations(
            epochKey,
            epoch,
            [0, 1, userState.sync.settings.sumFieldCount],
            [posRep, negRep, graffiti]
        )
            .then(t => t.wait())
    })

    it("user state transition", async () => {
        const userState = await genUserState(id, app)
        const oldEpoch = await unirep.attesterCurrentEpoch(app.address)
        await ethers.provider.send('evm_increaseTime', [userState.sync.calcEpochRemainingTime()+10])
        await ethers.provider.send('evm_mine', [])
        const newEpoch = await unirep.attesterCurrentEpoch(app.address)
        const { publicSignals, proof } = await userState.genUserStateTransitionProof({ toEpoch: newEpoch })
        await unirep.userStateTransition(publicSignals, proof)
            .then(t => t.wait())
    })

    it.skip("reputation proof", async () => {
        const userState = await genUserState(id, app)

        const epoch = await unirep.attesterCurrentEpoch(app.address)
        const { publicSignals, proof, } = await userState.genProveReputationProof({
            epoch,
            epkNonce: 0,
            minRep: 4,
            graffitiPreImage
        })
        await unirep.verifyReputationProof(publicSignals, proof).then(t => t.wait())
    })
})
