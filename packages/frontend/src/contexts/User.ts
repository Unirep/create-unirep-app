import { createContext } from 'react'
import { makeAutoObservable } from 'mobx'
import { stringifyBigInts } from '@unirep/utils'
import { Identity } from '@semaphore-protocol/identity'
import { UserState } from '@unirep/core'
import { DataProof } from '@unirep-app/circuits'
import { SERVER } from '../config'
import prover from './prover'
import { ethers } from 'ethers'

class User {
    currentEpoch: number = 0
    latestTransitionedEpoch: number = 0
    hasSignedUp: boolean = false
    data: bigint[] = []
    provableData: bigint[] = []
    userState?: UserState
    provider: any

    constructor() {
        makeAutoObservable(this)
        this.load()
    }

    async load() {
        const id: string = localStorage.getItem('id') ?? ''
        const identity = new Identity(id)
        if (!id) {
            localStorage.setItem('id', identity.toString())
        }

        const { UNIREP_ADDRESS, APP_ADDRESS, ETH_PROVIDER_URL } = await fetch(
            `${SERVER}/api/config`
        ).then((r) => r.json())

        const provider = ETH_PROVIDER_URL.startsWith('http')
            ? new ethers.providers.JsonRpcProvider(ETH_PROVIDER_URL)
            : new ethers.providers.WebSocketProvider(ETH_PROVIDER_URL)
        this.provider = provider

        const userState = new UserState(
            {
                provider,
                prover,
                unirepAddress: UNIREP_ADDRESS,
                attesterId: BigInt(APP_ADDRESS),
                _id: identity,
            },
            identity
        )
        await userState.sync.start()
        this.userState = userState
        await userState.waitForSync()
        this.hasSignedUp = await userState.hasSignedUp()
        await this.loadData()
        this.latestTransitionedEpoch =
            await this.userState.latestTransitionedEpoch()
    }

    get fieldCount() {
        return this.userState?.sync.settings.fieldCount
    }

    get sumFieldCount() {
        return this.userState?.sync.settings.sumFieldCount
    }

    epochKey(nonce: number) {
        if (!this.userState) return '0x'
        const epoch = this.userState.sync.calcCurrentEpoch()
        const key = this.userState.getEpochKeys(epoch, nonce)
        return `0x${key.toString(16)}`
    }

    async loadData() {
        if (!this.userState) throw new Error('user state not initialized')

        this.data = await this.userState.getData()
        this.provableData = await this.userState.getProvableData()
    }

    async signup() {
        if (!this.userState) throw new Error('user state not initialized')

        const signupProof = await this.userState.genUserSignUpProof()
        const data = await fetch(`${SERVER}/api/signup`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                publicSignals: signupProof.publicSignals,
                proof: signupProof.proof,
            }),
        }).then((r) => r.json())
        await this.provider.waitForTransaction(data.hash)
        await this.userState.waitForSync()
        this.hasSignedUp = await this.userState.hasSignedUp()
        this.latestTransitionedEpoch = this.userState.sync.calcCurrentEpoch()
    }

    async requestData(
        reqData: { [key: number]: string | number },
        epkNonce: number
    ) {
        if (!this.userState) throw new Error('user state not initialized')

        for (const key of Object.keys(reqData)) {
            if (reqData[+key] === '') {
                delete reqData[+key]
                continue
            }
        }
        if (Object.keys(reqData).length === 0) {
            throw new Error('No data in the attestation')
        }
        const epochKeyProof = await this.userState.genEpochKeyProof({
            nonce: epkNonce,
        })
        const data = await fetch(`${SERVER}/api/request`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    reqData,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof,
                })
            ),
        }).then((r) => r.json())
        await this.provider.waitForTransaction(data.hash)
        await this.userState.waitForSync()
        await this.loadData()
    }

    async stateTransition() {
        if (!this.userState) throw new Error('user state not initialized')

        await this.userState.waitForSync()
        const signupProof = await this.userState.genUserStateTransitionProof()
        const data = await fetch(`${SERVER}/api/transition`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                publicSignals: signupProof.publicSignals,
                proof: signupProof.proof,
            }),
        }).then((r) => r.json())
        await this.provider.waitForTransaction(data.hash)
        await this.userState.waitForSync()
        await this.loadData()
        this.latestTransitionedEpoch =
            await this.userState.latestTransitionedEpoch()
    }

    async proveData(data: { [key: number]: string | number }) {
        if (!this.userState) throw new Error('user state not initialized')
        const epoch = await this.userState.sync.loadCurrentEpoch()
        const stateTree = await this.userState.sync.genStateTree(epoch)
        const index = await this.userState.latestStateTreeLeafIndex(epoch)
        const stateTreeProof = stateTree.createProof(index)
        const provableData = await this.userState.getProvableData()
        const sumFieldCount = this.userState.sync.settings.sumFieldCount
        const values = Array(sumFieldCount).fill(0)
        for (let [key, value] of Object.entries(data)) {
            values[Number(key)] = value
        }
        const attesterId = this.userState.sync.attesterId
        const circuitInputs = stringifyBigInts({
            identity_secret: this.userState.id.secret,
            state_tree_indexes: stateTreeProof.pathIndices,
            state_tree_elements: stateTreeProof.siblings,
            data: provableData,
            epoch: epoch,
            attester_id: attesterId,
            value: values,
        })
        const { publicSignals, proof } = await prover.genProofAndPublicSignals(
            'dataProof',
            circuitInputs
        )
        const dataProof = new DataProof(publicSignals, proof, prover)
        const valid = await dataProof.verify()
        return stringifyBigInts({
            publicSignals: dataProof.publicSignals,
            proof: dataProof.proof,
            valid,
        })
    }
}

export default createContext(new User())
