import { ethers } from 'ethers'
import { Express } from 'express'
import { Synchronizer } from '@unirep/core'
import { EpochKeyProof, Prover } from '@unirep/circuits'
import { APP_ADDRESS } from '../config'
import TransactionManager from '../singletons/TransactionManager'
import ABI from '@unirep-app/contracts/abi/UnirepApp.json'

export default (app: Express, prover: Prover, synchronizer: Synchronizer) => {
    app.post('/api/request', async (req, res) => {
        try {
            const { reqData, publicSignals, proof } = req.body

            const epochKeyProof = new EpochKeyProof(
                publicSignals,
                proof,
                prover
            )
            const valid = await epochKeyProof.verify()
            if (!valid) {
                res.status(400).json({ error: 'Invalid proof' })
                return
            }
            const epoch = await synchronizer.loadCurrentEpoch()
            const appContract = new ethers.Contract(APP_ADDRESS, ABI)

            const keys = Object.keys(reqData)
            let calldata: any
            if (keys.length === 1) {
                calldata = appContract.interface.encodeFunctionData(
                    'submitAttestation',
                    [epochKeyProof.epochKey, epoch, keys[0], reqData[keys[0]]]
                )
            } else if (keys.length > 1) {
                calldata = appContract.interface.encodeFunctionData(
                    'submitManyAttestations',
                    [
                        epochKeyProof.epochKey,
                        epoch,
                        keys,
                        keys.map((k) => reqData[k]),
                    ]
                )
            }

            const hash = await TransactionManager.queueTransaction(
                APP_ADDRESS,
                calldata
            )
            res.json({ hash })
        } catch (error: any) {
            res.status(500).json({ error })
        }
    })
}
