import { expect } from "chai";
import { ethers } from "hardhat";
import { deployUnirep } from "@unirep/contracts/deploy"
import { genRandomSalt, hashOne, ZkIdentity } from "@unirep/utils";
import { schema, UserState } from "@unirep/core";
import { DB, SQLiteConnector } from 'anondb/node'
import { Unirep } from "@unirep/contracts";

import { defaultProver as prover } from '@unirep/circuits/provers/defaultProver';
import { UnirepApp } from "../typechain";

async function genUserState(id: ZkIdentity, app: UnirepApp) {
    // generate a user state
    const db: DB = await SQLiteConnector.create(schema, ':memory:')
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
    let unirep: Unirep
    let app: UnirepApp

    // epoch length
    const epochLength = 30
    let startTime = 0
    // generate random user id
    const id = new ZkIdentity()
    // graffiti preimage
    const graffitiPreImage = genRandomSalt()

    it("deployment", async function () {
        const [deployer] = await ethers.getSigners();
        unirep = await deployUnirep(deployer)
        const App = await ethers.getContractFactory("UnirepApp");
        app = await App.deploy(unirep.address, epochLength);

        expect(await app.attesterId()).to.equal(app.address)
        expect(await app.epochLength()).to.equal(epochLength)

        startTime = (await unirep.attesterStartTimestamp(app.address)).toNumber()
    });

    it("user sign up", async () => {
        const userState = await genUserState(id, app);

        // generate
        const { publicSignals, proof } = await userState.genUserSignUpProof()
        const tx = await app.userSignUp(publicSignals, proof)
        const receipt = await tx.wait()
        expect(receipt.status).to.equal(1)
    })

    it("submit attestations", async () => {
        const userState = await genUserState(id, app);

        const nonce = 0
        const { publicSignals, proof, epochKey, epoch } = await userState.genEpochKeyProof({ nonce })
        await unirep.verifyEpochKeyProof(publicSignals, proof).then(t => t.wait())

        const posRep = 5
        const negRep = 0
        const graffiti = hashOne(graffitiPreImage)
        const tx = await app.submitAttestation(epoch, epochKey, posRep, negRep, graffiti)
        const receipt = await tx.wait()
        expect(receipt.status).to.equal(1)
    })

    it("(attester/relayer) process attestations", async () => {
        {
            const tx = await app.buildHashchain();
            const receipt = await tx.wait()
            expect(receipt.status).to.equal(1)
        }

        {
            const userState = await genUserState(id, app)
            const epoch = await userState.loadCurrentEpoch()
            const index = await unirep.attesterHashchainProcessedCount(app.address, epoch)
            const hashchain = await unirep.attesterHashchain(app.address, epoch, index)
            const { publicSignals, proof } = await userState.genAggregateEpochKeysProof({
                epochKeys: hashchain.epochKeys as any,
                newBalances: hashchain.epochKeyBalances as any,
                hashchainIndex: hashchain.index as any,
                epoch,
            })
            const tx = await app.processHashchain(publicSignals, proof)
            const receipt = await tx.wait()
            expect(receipt.status).to.equal(1)
        }
    })

    it("user state transition", async () => {
        const oldEpoch = await app.currentEpoch()
        const timestamp = Math.floor(+new Date() / 1000)
        const waitTime = startTime + epochLength - timestamp
        for (; ;) {
            await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
            await ethers.provider.send('evm_mine', [])
            const newEpoch = await app.currentEpoch()
            if ((oldEpoch.toNumber() + 1) == newEpoch.toNumber()) break
        }
        const newEpoch = await app.currentEpoch()
        const userState = await genUserState(id, app)
        const { publicSignals, proof } = await userState.genUserStateTransitionProof({ toEpoch: newEpoch.toNumber() })
        const tx = await app.userStateTransition(publicSignals, proof)
        const receipt = await tx.wait()
        expect(receipt.status).to.equal(1)
    })

    it("reputation proof", async () => {
        const userState = await genUserState(id, app)

        const { publicSignals, proof, } = await userState.genProveReputationProof({
            epkNonce: 0,
            minRep: 4,
            graffitiPreImage
        })
        await unirep.verifyReputationProof(publicSignals, proof).then(t => t.wait())
    })
})