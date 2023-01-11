import { createContext} from 'react'
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
  reputation = {
    posRep: 0,
    negRep: 0,
    graffiti: 0,
    timestamp: 0,
  }
  provableReputation = {
    posRep: 0,
    negRep: 0,
    graffiti: 0,
    timestamp: 0,
  }

  constructor() {
    makeAutoObservable(this)
    this.load()
  }

  async load() {
    const id = localStorage.getItem('id')
    const identity = new ZkIdentity(id ? Strategy.SERIALIZED : Strategy.RANDOM, id)
    if (!id) {
      localStorage.setItem('id', identity.serializeIdentity())
    }

    const db = new MemoryConnector(constructSchema(schema))
    const userState = new UserState({
      db,
      provider,
      prover,
      unirepAddress: UNIREP_ADDRESS,
      attesterId: APP_ADDRESS,
      _id: identity,
    })
    await userState.start()
    await userState.waitForSync()
    this.hasSignedUp = await userState.hasSignedUp()
    this.userState = userState
    await this.loadReputation()
    this.latestTransitionedEpoch = await this.userState.latestTransitionedEpoch()
  }

  // TODO: make this non-async
  async epochKey(nonce) {
    if (!this.userState) return '0x'
    const epoch = this.userState.calcCurrentEpoch()
    const keys = await this.userState.getEpochKeys(epoch)
    const key = keys[nonce]
    return `0x${key.toString(16)}`
  }

  async loadReputation() {
    const epoch = this.userState.calcCurrentEpoch()
    this.reputation = await this.userState.getRepByAttester(null, epoch + 1)
    this.provableReputation = await this.userState.getRepByAttester()
  }

  async signup(message) {
    const signupProof = await this.userState.genUserSignUpProof()
    const data = await fetch(`${SERVER}/api/signup`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        publicSignals: signupProof.publicSignals,
        proof: signupProof.proof,
      })
    }).then(r => r.json())
    await provider.waitForTransaction(data.hash)
    await this.userState.waitForSync()
    this.hasSignedUp = await this.userState.hasSignedUp()
    this.latestTransitionedEpoch = this.userState.calcCurrentEpoch()
  }

  async requestReputation(posRep, negRep, graffitiPreImage, epkNonce) {
    const epochKeyProof = await this.userState.genEpochKeyProof({nonce: epkNonce})
    const graffiti = hash1([`0x${Buffer.from(graffitiPreImage.toString()).toString('hex')}`])
    const data = await fetch(`${SERVER}/api/request`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(stringifyBigInts({
        posRep,
        negRep,
        graffiti,
        publicSignals: epochKeyProof.publicSignals,
        proof: epochKeyProof.proof,
      }))
    }).then(r => r.json())
    await provider.waitForTransaction(data.hash)
    await this.userState.waitForSync()
    await this.loadReputation()
  }

  async stateTransition() {
    await this.userState.waitForSync()
    const signupProof = await this.userState.genUserStateTransitionProof()
    const data = await fetch(`${SERVER}/api/transition`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        publicSignals: signupProof.publicSignals,
        proof: signupProof.proof,
      })
    }).then(r => r.json())
    await provider.waitForTransaction(data.hash)
    await this.userState.waitForSync()
    await this.loadReputation()
    this.latestTransitionedEpoch = await this.userState.latestTransitionedEpoch()
  }

  async proveReputation(minRep = 0, _graffitiPreImage = 0) {
    let graffitiPreImage = _graffitiPreImage
    if (typeof graffitiPreImage === 'string') {
      graffitiPreImage = poseidon([`0x${Buffer.from(_graffitiPreImage).toString('hex')}`])
    }
    const reputationProof = await this.userState.genProveReputationProof({
      epkNonce: 0,
      minRep: Number(minRep), graffitiPreImage
    })
    return { ...reputationProof, valid: await reputationProof.verify() }
  }
}

export default createContext(new User())
