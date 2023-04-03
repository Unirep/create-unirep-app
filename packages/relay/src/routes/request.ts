import { ethers } from 'ethers'
import { Express } from "express";
import { DB } from "anondb/node";
import { Synchronizer } from "@unirep/core";
import { EpochKeyProof } from '@unirep/contracts'
import { APP_ADDRESS } from '../config'
import TransactionManager from '../singletons/TransactionManager'
import UNIREP_APP from "@unirep-app/contracts/artifacts/contracts/UnirepApp.sol/UnirepApp.json"

export default (app: Express, db: DB, synchronizer: Synchronizer) => {
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

      const appContract = new ethers.Contract(APP_ADDRESS, UNIREP_APP.abi)
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
    } catch (error: any) {
      res.status(500).json({ error })
    }

  })
}
