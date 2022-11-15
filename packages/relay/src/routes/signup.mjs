import { SignupProof } from '@unirep/contracts'
import { ethers } from 'ethers'
import { APP_ADDRESS } from '../config.mjs'
import TransactionManager from '../singletons/TransactionManager.mjs'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const UnirepApp = require("@unirep-app/contracts/artifacts/contracts/UnirepApp.sol/UnirepApp.json")

export default ({ app, db, synchronizer }) => {
  app.post('/api/signup', async (req, res) => {

    try {
      const { publicSignals, proof } = req.body
      const signupProof = new SignupProof(publicSignals, proof, synchronizer.prover)
      const valid = await signupProof.verify()
      if (!valid) {
        res.status(400).json({ error: 'Invalid proof' })
        return
      }
      const currentEpoch = synchronizer.calcCurrentEpoch()
      if (currentEpoch !== Number(BigInt(signupProof.epoch))) {
        res.status(400).json({ error: 'Wrong epoch' })
        return
      }
      // make a transaction lil bish
      const appContract = new ethers.Contract(APP_ADDRESS, UnirepApp.abi)
      // const contract =
      const calldata = appContract.interface.encodeFunctionData(
        'userSignUp',
        [signupProof.publicSignals, signupProof.proof]
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
