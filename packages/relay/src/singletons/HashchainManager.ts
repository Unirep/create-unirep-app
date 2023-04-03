import TransactionManager from './TransactionManager'
import { Synchronizer } from "@unirep/core";

class HashchainManager {
  latestSyncEpoch = 0
  synchronizer?: Synchronizer;

  configure(_synchronizer: Synchronizer) {
    this.synchronizer = _synchronizer;
  }

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
    if (!this.synchronizer) throw new Error("Not initialized");

    // Make sure we're synced up
    await this.synchronizer.waitForSync()
    const currentEpoch = this.synchronizer.calcCurrentEpoch()
    for (let x = this.latestSyncEpoch; x <= currentEpoch; x++) {
      // check the owed keys
      const [
        owedKeys,
        processedHashchains,
        totalHashchains,
      ] = await Promise.all([
        this.synchronizer.unirepContract.attesterOwedEpochKeys(this.synchronizer.attesterId, x),
        this.synchronizer.unirepContract.attesterHashchainProcessedCount(this.synchronizer.attesterId, x),
        this.synchronizer.unirepContract.attesterHashchainTotalCount(this.synchronizer.attesterId, x),
      ])
      if (
        BigInt(owedKeys.toString()) === BigInt(0) &&
        BigInt(processedHashchains.toString()) === BigInt(totalHashchains.toString()) &&
        this.synchronizer.calcCurrentEpoch() !== x
      ) {
        this.latestSyncEpoch = x
        console.log('processed epoch', x)
        continue
      }
      if (
        BigInt(processedHashchains.toString()) === BigInt(totalHashchains.toString()) &&
        BigInt(owedKeys.toString()) < BigInt(this.synchronizer.settings.aggregateKeyCount) &&
        this.synchronizer.calcCurrentEpoch() === x
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
    if (!this.synchronizer) throw new Error("Not initialized");

    // first check if there is an unprocessed hashchain
    {
      const processedHashchains = await this.synchronizer.unirepContract.attesterHashchainProcessedCount(this.synchronizer.attesterId, epoch)
      const totalHashchains = await this.synchronizer.unirepContract.attesterHashchainTotalCount(this.synchronizer.attesterId, epoch)
      if (BigInt(processedHashchains.toString()) === BigInt(totalHashchains.toString())) {
        // build a hashchain
        const calldata = this.synchronizer.unirepContract.interface.encodeFunctionData(
          'buildHashchain',
          [this.synchronizer.attesterId, epoch]
        )
        const hash = await TransactionManager.queueTransaction(
          this.synchronizer.unirepContract.address,
          calldata
        )
        await this.synchronizer.provider.waitForTransaction(hash)
      }
    }

    const totalHashchains = await this.synchronizer.unirepContract.attesterHashchainTotalCount(this.synchronizer.attesterId, epoch)
    const hashchain = await this.synchronizer.unirepContract.attesterHashchain(
      this.synchronizer.attesterId,
      epoch,
      BigInt(totalHashchains.toString()) - BigInt(1)
    )
    if (hashchain.processed) {
      // it already got processed somehow
      return
    }
    const aggProof = await this.synchronizer.genAggregateEpochKeysProof({
      epochKeys: hashchain.epochKeys,
      hashchainIndex: hashchain.index,
      epoch,
      newBalances: hashchain.epochKeyBalances,
    })
    if (!await aggProof.verify()) {
      throw new Error('Invalid aggregate proof generated')
    }
    const { publicSignals, proof } = aggProof
    const calldata = this.synchronizer.unirepContract.interface.encodeFunctionData(
      'processHashchain',
      [publicSignals, proof]
    )
    const hash = await TransactionManager.queueTransaction(
      this.synchronizer.unirepContract.address,
      calldata
    )
    await this.synchronizer.provider.waitForTransaction(hash)
  }
}

export default new HashchainManager()
