import express from 'express'
import { ethers } from 'ethers'
import { UserStateTransitionProof } from '@unirep/circuits'
import { getUnirepContract } from '@unirep/contracts'
import { defaultProver as prover } from '@unirep/circuits/provers/defaultProver'
import { ETH_PROVIDER_URL, PRIVATE_KEY, UNIREP_ADDRESS } from '../config'

const router = express.Router()

router.post('/api/transition', async (req, res) => {
    try {
        const before = new Date()
        const { publicSignals, proof } = req.body
        const transitionProof = new UserStateTransitionProof(
            publicSignals,
            proof,
            prover
        )
        const valid = await transitionProof.verify()
        if (!valid) {
            res.status(400).json({ error: 'Invalid proof' })
            return
        }

        if (!valid) {
            res.status(400).json({ error: 'Invalid proof' })
            return
        }
        if (UNIREP_ADDRESS === undefined) {
            res.status(400).json({ error: 'UNIREP_ADDRESS is undefined' })
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
        const provider = new ethers.providers.JsonRpcProvider(ETH_PROVIDER_URL)
        const signer = new ethers.Wallet(PRIVATE_KEY, provider)
        const unirep = getUnirepContract(UNIREP_ADDRESS, signer)

        const tx = await unirep.userStateTransition(
            transitionProof.publicSignals,
            transitionProof.proof
        )

        const after = new Date()
        console.log(`Transition took ${after.getTime() - before.getTime()} ms`)
        res.json({ hash: tx.hash })
    } catch (error: any) {
        res.status(500).json({ error })
    }
})

export default router
