import { ethers } from 'ethers'

export class TransactionManager {
  configure(key, provider, db) {
    this.wallet = new ethers.Wallet(key, provider)
    this._db = db
  }

  async start() {
    if (!this.wallet || !this._db) throw new Error('Not initialized')
    const latestNonce = await this.wallet.getTransactionCount()
    await this._db.upsert('AccountNonce', {
      where: {
        address: this.wallet.address,
      },
      create: {
        address: this.wallet.address,
        nonce: latestNonce,
      },
      update: {},
    })
    this.startDaemon()
  }

  async startDaemon() {
    if (!this._db) throw new Error('No db connected')
    for (;;) {
      const nextTx = await this._db.findOne('AccountTransaction', {
        where: {},
        orderBy: {
          nonce: 'asc',
        },
      })
      if (!nextTx) {
        await new Promise((r) => setTimeout(r, 5000))
        continue
      }
      const sent = await this.tryBroadcastTransaction(nextTx.signedData)
      if (sent) {
        await this._db.delete('AccountTransaction', {
          where: {
            signedData: nextTx.signedData,
          },
        })
      } else {
        const randWait = Math.random() * 2000
        await new Promise((r) => setTimeout(r, 1000 + randWait))
      }
    }
  }

  async tryBroadcastTransaction(signedData) {
    if (!this.wallet) throw new Error('Not initialized')
    const hash = ethers.utils.keccak256(signedData)
    try {
      console.log(`Sending tx ${hash}`)
      await this.wallet.provider.sendTransaction(signedData)
      return true
    } catch (err) {
      const tx = await this.wallet.provider.getTransaction(hash)
      if (tx) {
        // if the transaction is reverted the nonce is still used, so we return true
        return true
      }
      if (
        err
          .toString()
          .indexOf(
            'Your app has exceeded its compute units per second capacity'
          ) !== -1
      ) {
        await new Promise((r) => setTimeout(r, 1000))
        return this.tryBroadcastTransaction(signedData)
      } else {
        console.log(err)
        return false
      }
    }
  }

  async getNonce(address) {
    const latest = await this._db?.findOne('AccountNonce', {
      where: {
        address,
      },
    })
    const updated = await this._db?.update('AccountNonce', {
      where: {
        address,
        nonce: latest.nonce,
      },
      update: {
        nonce: latest.nonce + 1,
      },
    })
    if (updated === 0) {
      await new Promise((r) => setTimeout(r, Math.random() * 500))
      return this.getNonce(address)
    }
    return latest.nonce
  }

  async wait(hash) {
    return this.wallet?.provider.waitForTransaction(hash)
  }

  async queueTransaction(to, data = {}) {
    const args = {}
    if (typeof data === 'string') {
      // assume it's input data
      args.data = data
    } else {
      Object.assign(args, data)
    }
    if (!this.wallet) throw new Error('Not initialized')
    if (!args.gasLimit) {
      // don't estimate, use this for unpredictable gas limit tx's
      // transactions may revert with this
      const gasLimit = await this.wallet.provider.estimateGas({
        to,
        from: this.wallet.address,
        ...args,
      })
      Object.assign(args, {
        gasLimit: gasLimit.add(50000),
      })
    }
    const nonce = await this.getNonce(this.wallet.address)
    const signedData = await this.wallet.signTransaction({
      nonce,
      to,
      // gasPrice: 2 * 10 ** 9, // 2 gwei
      // gasPrice: 10000,
      gasPrice: 299365979,
      ...args,
    })
    await this._db?.create('AccountTransaction', {
      address: this.wallet.address,
      signedData,
      nonce,
    })
    return ethers.utils.keccak256(signedData)
  }
}

export default new TransactionManager()
