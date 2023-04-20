import path from 'path'
import fs from 'fs'
import express from 'express'
import { Synchronizer } from '@unirep/core'
import { SQLiteConnector } from 'anondb/node.js'
import prover from './singletons/prover'
import schema from './singletons/schema'

import {
    provider,
    PRIVATE_KEY,
    UNIREP_ADDRESS,
    DB_PATH,
    APP_ADDRESS,
} from './config'
import TransactionManager from './singletons/TransactionManager'

main().catch((err) => {
    console.log(`Uncaught error: ${err}`)
    process.exit(1)
})

async function main() {
    const db = await SQLiteConnector.create(schema, DB_PATH ?? ':memory:')

    const synchronizer = new Synchronizer({
        db,
        provider,
        unirepAddress: UNIREP_ADDRESS,
        attesterId: BigInt(APP_ADDRESS),
        prover,
    })

    await synchronizer.start()

    TransactionManager.configure(PRIVATE_KEY, provider, synchronizer._db)
    await TransactionManager.start()

    const app = express()
    const port = process.env.PORT ?? 8000
    app.listen(port, () => console.log(`Listening on port ${port}`))
    app.use('*', (req, res, next) => {
        res.set('access-control-allow-origin', '*')
        res.set('access-control-allow-headers', '*')
        next()
    })
    app.use(express.json())
    app.use('/build', express.static(path.join(__dirname, '../keys')))

    // import all non-index files from this folder
    const routeDir = path.join(__dirname, 'routes')
    const routes = await fs.promises.readdir(routeDir)
    for (const routeFile of routes) {
        const { default: route } = await import(path.join(routeDir, routeFile))
        route(app, synchronizer._db, synchronizer)
    }
}
