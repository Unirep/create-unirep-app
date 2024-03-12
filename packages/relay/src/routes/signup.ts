import express from 'express'
import { ethers } from 'ethers'
import { SignupProof } from '@unirep/circuits'
import { defaultProver as prover } from '@unirep/circuits/provers/defaultProver'
import ABI from '@unirep-app/contracts/abi/UnirepApp.json'
import { APP_ADDRESS, ETH_PROVIDER_URL, PRIVATE_KEY } from '../config'

const router = express.Router()

router.post('/api/signup', async (req, res) => {
    try {
        const before = new Date()
        const { publicSignals, proof } = req.body

        const signupProof = new SignupProof(publicSignals, proof, prover)
        const valid = await signupProof.verify()
        if (!valid) {
            res.status(400).json({ error: 'Invalid proof' })
            return
        }
        if (APP_ADDRESS === undefined) {
            res.status(400).json({ error: 'APP_ADDRESS is undefined' })
            return
        }
        if (ETH_PROVIDER_URL === undefined) {
            res.status(400).json({ error: 'ETH_PROVIDER_URL is undefined' })
            return
        }
        if (PRIVATE_KEY === undefined) {
            res.status(400).json({ error: 'PRIVATE_KEY is undefined' })
            return
        }
        // make a transaction lil bish
        const provider = new ethers.providers.JsonRpcProvider(ETH_PROVIDER_URL)
        const signer = new ethers.Wallet(PRIVATE_KEY, provider)
        const appContract = new ethers.Contract(APP_ADDRESS, ABI, signer)
        const tx = await appContract.userSignUp(
            signupProof.publicSignals,
            signupProof.proof
        )
        const after = new Date()
        console.log(`Signup took ${after.getTime() - before.getTime()} ms`)
        res.json({ hash: tx.hash })
    } catch (error) {
        res.status(500).json({ error })
    }
})

export default router
