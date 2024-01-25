import express from 'express'
import { UNIREP_ADDRESS, APP_ADDRESS, ETH_PROVIDER_URL } from '../config'
const router = express.Router()

router.get('/api/config', (_, res) =>
    res.json({
        UNIREP_ADDRESS,
        APP_ADDRESS,
        ETH_PROVIDER_URL,
    })
)

export default router
