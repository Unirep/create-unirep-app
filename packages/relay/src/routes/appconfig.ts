import { Express } from 'express'
import { UNIREP_ADDRESS, APP_ADDRESS, ETH_PROVIDER_URL } from '../config'

export default (app: Express) => {
    app.get('/api/config', (_, res) =>
        res.json({
            UNIREP_ADDRESS,
            APP_ADDRESS,
            ETH_PROVIDER_URL,
        })
    )
}
