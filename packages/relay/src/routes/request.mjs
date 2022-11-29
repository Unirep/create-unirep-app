import { ethers } from 'ethers'
import { EpochKeyProof } from '@unirep/contracts'
import { APP_ADDRESS } from '../config.mjs'
import TransactionManager from '../singletons/TransactionManager.mjs'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const UnirepApp = require("@unirep-app/contracts/artifacts/contracts/UnirepApp.sol/UnirepApp.json")

export default ({ app, db, synchronizer }) => {
  app.post('/api/request', async (req, res) => {

    try {
      const { posRep, negRep, graffiti, publicSignals, proof } = req.body

      const epochKeyProof = new EpochKeyProof(publicSignals, proof, synchronizer.prover)
      const valid = await epochKeyProof.verify()
      if (!valid) {
        res.status(400).json({ error: 'Invalid proof' })
        return
      }
      const epoch = await synchronizer.loadCurrentEpoch()

      const appContract = new ethers.Contract(APP_ADDRESS, UnirepApp.abi)
      // const contract =
      const calldata = appContract.interface.encodeFunctionData(
        'submitAttestation',
        [epoch, epochKeyProof.epochKey, posRep, negRep, graffiti]
      )
      const hash = await TransactionManager.queueTransaction(
        APP_ADDRESS,
        calldata,
      )
      res.json({ hash })
    } catch (error) {
      res.status(500).json({ error })
    }

  })
}
