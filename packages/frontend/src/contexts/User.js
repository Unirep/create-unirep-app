import { createContext } from 'react'
import { makeAutoObservable } from 'mobx'
import { ZkIdentity, Strategy, hash1, stringifyBigInts } from '@unirep/utils'
import { UserState, schema } from '@unirep/core'
import { MemoryConnector } from 'anondb/web'
import { constructSchema } from 'anondb/types'
import { provider, UNIREP_ADDRESS, APP_ADDRESS, SERVER } from '../config'
import prover from './prover'
import poseidon from 'poseidon-lite'

class User {
  currentEpoch
  latestTransitionedEpoch
  hasSignedUp = false
  data = []
  provableData = []
  userState = null

  constructor() {
    makeAutoObservable(this)
    this.load()
  }

  async load() {
    const id = localStorage.getItem('id')
    const identity = new ZkIdentity(
      id ? Strategy.SERIALIZED : Strategy.RANDOM,
      id
    )
    if (!id) {
      localStorage.setItem('id', identity.serializeIdentity())
    }

    const userState = new UserState({
      provider,
      prover,
      unirepAddress: UNIREP_ADDRESS,
      attesterId: APP_ADDRESS,
      _id: identity,
    })
    await userState.sync.start()
    this.userState = userState
    await userState.waitForSync()
    this.hasSignedUp = await userState.hasSignedUp()
    await this.loadReputation()
    this.latestTransitionedEpoch =
      await this.userState.latestTransitionedEpoch()
  }

  get fieldCount() {
    return this.userState?.sync.settings.fieldCount
  }

  get sumFieldCount() {
    return this.userState?.sync.settings.sumFieldCount
  }

  epochKey(nonce) {
    if (!this.userState) return '0x'
    const epoch = this.userState.sync.calcCurrentEpoch()
    const keys = this.userState.getEpochKeys(epoch)
    const key = keys[nonce]
    return `0x${key.toString(16)}`
  }

  async loadReputation() {
    this.data = await this.userState.getData()
    this.provableData = await this.userState.getProvableData()
  }

  async signup(message) {
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
    await provider.waitForTransaction(data.hash)
    await this.userState.waitForSync()
    this.hasSignedUp = await this.userState.hasSignedUp()
    this.latestTransitionedEpoch = this.userState.sync.calcCurrentEpoch()
  }

  async requestReputation(reqData, epkNonce) {
    for (const key of Object.keys(reqData)) {
      if (+key > this.sumFieldCount && +key % 2 !== this.sumFieldCount % 2) {
        throw new Error('Cannot change timestamp field')
      }
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
    await provider.waitForTransaction(data.hash)
    await this.userState.waitForSync()
    await this.loadReputation()
  }

  async stateTransition() {
    const sealed = await this.userState.sync.isEpochSealed(
      await this.userState.latestTransitionedEpoch()
    )
    if (!sealed) {
      throw new Error('From epoch is not yet sealed')
    }
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
    await provider.waitForTransaction(data.hash)
    await this.userState.waitForSync()
    await this.loadReputation()
    this.latestTransitionedEpoch =
      await this.userState.latestTransitionedEpoch()
  }

  async proveReputation(minRep = 0, _graffitiPreImage = 0) {
    let graffitiPreImage = _graffitiPreImage
    if (typeof graffitiPreImage === 'string') {
      graffitiPreImage = `0x${Buffer.from(_graffitiPreImage).toString('hex')}`
    }
    const reputationProof = await this.userState.genProveReputationProof({
      epkNonce: 0,
      minRep: Number(minRep),
      graffitiPreImage,
    })
    return { ...reputationProof, valid: await reputationProof.verify() }
  }
}

export default createContext(new User())
