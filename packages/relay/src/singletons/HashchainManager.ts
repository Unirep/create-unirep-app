import { Synchronizer } from '@unirep/core'
import { Circuit, BuildOrderedTree } from '@unirep/circuits'
import { stringifyBigInts } from '@unirep/utils'
import TransactionManager from './TransactionManager'

class HashchainManager {
    latestSyncEpoch = 0
    synchronizer?: Synchronizer

    configure(_synchronizer: Synchronizer) {
        this.synchronizer = _synchronizer
    }

    async startDaemon() {
        // return
        // first sync up all the historical epochs
        // then start watching
        await this.sync()
        for (;;) {
            // try to make a
            await new Promise((r) => setTimeout(r, 10000))
            await this.sync()
        }
    }

    async sync() {
        if (!this.synchronizer) throw new Error('Not initialized')

        // Make sure we're synced up
        await this.synchronizer.waitForSync()
        const currentEpoch = this.synchronizer.calcCurrentEpoch()
        for (let x = this.latestSyncEpoch; x < currentEpoch; x++) {
            // check the owed keys
            if (this.synchronizer.provider.network.chainId === 31337) {
                // hardhat dev nodes need to have their state refreshed manually
                // for view only functions
                await this.synchronizer.provider.send('evm_mine', [])
            }
            const isSealed =
                await this.synchronizer.unirepContract.attesterEpochSealed(
                    this.synchronizer.attesterId,
                    x
                )
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
        if (!this.synchronizer) throw new Error('Not initialized')

        // first check if there is an unprocessed hashchain
        const leafPreimages = await this.synchronizer.genEpochTreePreimages(
            epoch
        )
        const { circuitInputs } = await BuildOrderedTree.buildInputsForLeaves(
            leafPreimages
        )
        const r = await this.synchronizer.prover.genProofAndPublicSignals(
            Circuit.buildOrderedTree,
            stringifyBigInts(circuitInputs)
        )
        const { publicSignals, proof } = new BuildOrderedTree(
            r.publicSignals,
            r.proof
        )
        const calldata =
            this.synchronizer.unirepContract.interface.encodeFunctionData(
                'sealEpoch',
                [epoch, this.synchronizer.attesterId, publicSignals, proof]
            )
        const hash = await TransactionManager.queueTransaction(
            this.synchronizer.unirepContract.address,
            calldata
        )
        await this.synchronizer.provider.waitForTransaction(hash)
    }
}

export default new HashchainManager()
