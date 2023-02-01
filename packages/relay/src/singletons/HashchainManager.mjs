import { ethers } from 'ethers'
import { Circuit, BuildOrderedTree } from '@unirep/circuits'
import { stringifyBigInts } from '@unirep/utils'
import TransactionManager from './TransactionManager.mjs'
import synchronizer from './AppSynchronizer.mjs'

class HashchainManager {
  latestSyncEpoch = 0
  async startDaemon() {
    // first sync up all the historical epochs
    // then start watching
    await this.sync()
    for (;;) {
      // try to make a
      await new Promise(r => setTimeout(r, 10000))
      await this.sync()
    }
  }

  async sync() {
    // Make sure we're synced up
    await synchronizer.waitForSync()
    const currentEpoch = synchronizer.calcCurrentEpoch()
    for (let x = this.latestSyncEpoch; x < currentEpoch; x++) {
      // check the owed keys
      const isSealed = await synchronizer.unirepContract.attesterEpochSealed(synchronizer.attesterId, x)
      if (!isSealed) {
        console.log('executing epoch', x)
        // otherwise we need to make an ordered tree
        await this.processEpochKeys(x)
        this.latestSyncEpoch = x
      } else {
        this.latestSyncEpoch = x
      }
    }
  }

  async processEpochKeys(epoch) {
    // first check if there is an unprocessed hashchain
    const leafPreimages = await synchronizer.genEpochTreePreimages(epoch)
    const { circuitInputs } = await BuildOrderedTree.buildInputsForLeaves(leafPreimages)
    const r = await synchronizer.prover.genProofAndPublicSignals(
      Circuit.buildOrderedTree,
      stringifyBigInts(circuitInputs)
    )
    const { publicSignals, proof } = new BuildOrderedTree(
      r.publicSignals,
      r.proof
    )
    const calldata = synchronizer.unirepContract.interface.encodeFunctionData(
      'sealEpoch',
      [
        epoch,
        synchronizer.attesterId,
        publicSignals,
        proof
      ]
    )
    const hash = await TransactionManager.queueTransaction(
      synchronizer.unirepContract.address,
      calldata
    )
    await synchronizer.provider.waitForTransaction(hash)
  }
}

export default new HashchainManager()
