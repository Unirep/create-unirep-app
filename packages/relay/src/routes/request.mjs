import { ethers } from 'ethers'
import { EpochKeyProof } from '@unirep/circuits'
import { APP_ADDRESS } from '../config.mjs'
import TransactionManager from '../singletons/TransactionManager.mjs'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const UnirepApp = require('@unirep-app/contracts/artifacts/contracts/UnirepApp.sol/UnirepApp.json')

export default ({ app, db, synchronizer }) => {
  app.post('/api/request', async (req, res) => {
    try {
      const { reqData, publicSignals, proof } = req.body

      const epochKeyProof = new EpochKeyProof(
        publicSignals,
        proof,
        synchronizer.prover
      )
      const valid = await epochKeyProof.verify()
      if (!valid) {
        res.status(400).json({ error: 'Invalid proof' })
        return
      }
      const epoch = await synchronizer.loadCurrentEpoch()
      const appContract = new ethers.Contract(APP_ADDRESS, UnirepApp.abi)

      const keys = Object.keys(reqData)
      let calldata
      if (keys.length === 1) {
        calldata = appContract.interface.encodeFunctionData(
          'submitAttestation',
          [epochKeyProof.epochKey, epoch, keys[0], reqData[keys[0]]]
        )
      } else if (keys.length > 1) {
        calldata = appContract.interface.encodeFunctionData(
          'submitManyAttestations',
          [epochKeyProof.epochKey, epoch, keys, keys.map((k) => reqData[k])]
        )
      }

      const hash = await TransactionManager.queueTransaction(
        APP_ADDRESS,
        calldata
      )
      res.json({ hash })
    } catch (error) {
      res.status(500).json({ error })
    }
  })
}
