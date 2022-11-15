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
    for (let x = this.latestSyncEpoch; x <= currentEpoch; x++) {
      // check the owed keys
      const [
        owedKeys,
        processedHashchains,
        totalHashchains,
      ] = await Promise.all([
        synchronizer.unirepContract.attesterOwedEpochKeys(synchronizer.attesterId, x),
        synchronizer.unirepContract.attesterHashchainProcessedCount(synchronizer.attesterId, x),
        synchronizer.unirepContract.attesterHashchainTotalCount(synchronizer.attesterId, x),
      ])
      if (
        BigInt(owedKeys.toString()) === BigInt(0) &&
        BigInt(processedHashchains.toString()) === BigInt(totalHashchains.toString()) &&
        synchronizer.calcCurrentEpoch() !== x
      ) {
        this.latestSyncEpoch = x
        console.log('processed epoch', x)
        continue
      }
      if (
        BigInt(processedHashchains.toString()) === BigInt(totalHashchains.toString()) &&
        BigInt(owedKeys.toString()) < BigInt(synchronizer.settings.aggregateKeyCount) &&
        synchronizer.calcCurrentEpoch() === x
      ) {
        // wait until there are more epoch keys to process
        // or the current epoch ends
        return
      }
      console.log('executing epoch', x)
      // otherwise we need to make a hashchain
      await this.processEpochKeys(x)
      // iterate on this epoch again because there may be more epoch keys to process
      x--
    }
  }

  async processEpochKeys(epoch) {
    // first check if there is an unprocessed hashchain
    {
      const processedHashchains = await synchronizer.unirepContract.attesterHashchainProcessedCount(synchronizer.attesterId, epoch)
      const totalHashchains = await synchronizer.unirepContract.attesterHashchainTotalCount(synchronizer.attesterId, epoch)
      if (BigInt(processedHashchains.toString()) === BigInt(totalHashchains.toString())) {
        // build a hashchain
        const calldata = synchronizer.unirepContract.interface.encodeFunctionData(
          'buildHashchain',
          [synchronizer.attesterId, epoch]
        )
        const hash = await TransactionManager.queueTransaction(
          synchronizer.unirepContract.address,
          calldata
        )
        await synchronizer.provider.waitForTransaction(hash)
      }
    }

    const totalHashchains = await synchronizer.unirepContract.attesterHashchainTotalCount(synchronizer.attesterId, epoch)
    const hashchain = await synchronizer.unirepContract.attesterHashchain(
      synchronizer.attesterId,
      epoch,
      BigInt(totalHashchains.toString()) - BigInt(1)
    )
    if (hashchain.processed) {
      // it already got processed somehow
      return
    }
    const aggProof = await synchronizer.genAggregateEpochKeysProof({
      epochKeys: hashchain.epochKeys,
      hashchainIndex: hashchain.index,
      epoch,
      newBalances: hashchain.epochKeyBalances,
    })
    if (!await aggProof.verify()) {
      throw new Error('Invalid aggregate proof generated')
    }
    const { publicSignals, proof } = aggProof
    const calldata = synchronizer.unirepContract.interface.encodeFunctionData(
      'processHashchain',
      [publicSignals, proof]
    )
    const hash = await TransactionManager.queueTransaction(
      synchronizer.unirepContract.address,
      calldata
    )
    await synchronizer.provider.waitForTransaction(hash)
  }
}

export default new HashchainManager()
