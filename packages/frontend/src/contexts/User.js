import { createContext} from 'react'
import { makeAutoObservable } from 'mobx'
import { ZkIdentity, Strategy, hash1, stringifyBigInts } from '@unirep/utils'
import { UserState, schema } from '@unirep/core'
import { MemoryConnector } from 'anondb/web'
import { constructSchema } from 'anondb/types'
import { provider, UNIREP_ADDRESS, APP_ADDRESS, SERVER } from '../config'
import prover from './prover'

class User {

  currentEpoch
  latestTransitionedEpoch
  hasSignedUp = false
  posRep = 0
  negRep = 0
  graffiti = 0
  valid = false

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
    this.watchTransition()
  }

  async watchTransition() {
    for (;;) {
      const epoch = this.latestTransitionedEpoch
      const hasSignedUp = await this.userState.hasSignedUp()
      const currentEpoch = this.userState.calcCurrentEpoch()
      this.currentEpoch = currentEpoch
      const { posRep, negRep, graffiti } = await this.userState.getRepByAttester()
      this.posRep = posRep
      this.negRep = negRep
      this.graffiti = graffiti
      try {
        if (hasSignedUp && epoch !== currentEpoch) {
          await this.stateTransition()
        }
        this.latestTransitionedEpoch = currentEpoch
      } catch (err) {
        await new Promise(r => setTimeout(r, 10000))
        continue
      }
      const time = this.userState.calcEpochRemainingTime()
      await new Promise(r => setTimeout(r, time * 1000))
    }
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
    const graffiti = hash1([graffitiPreImage])
    console.log({
      posRep,
        negRep,
        graffiti,
        publicSignals: epochKeyProof.publicSignals,
        proof: epochKeyProof.proof,
    })
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
  }

  async proveReputation(minRep, graffitiPreImage) {
    const reputationProof = await this.userState.genProveReputationProof({
      epkNonce: 0,
      minRep: Number(minRep), graffitiPreImage
    })
    this.publicSignals = reputationProof.publicSignals
    this.proof = reputationProof.proof
    this.valid = await reputationProof.verify()
  }
}

export default createContext(new User())
