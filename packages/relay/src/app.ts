import express from 'express'
import config from './routes/appconfig'
import signup from './routes/signup'
import request from './routes/request'
import transition from './routes/transition'

require('dotenv').config()

const app = express()

app.use(express.json())

app.get<{}, any>('/', (req, res) => {
    res.json({
        message: 'Welcome to Unirep App API!',
    })
})
app.use('*', (req, res, next) => {
    res.set('access-control-allow-origin', '*')
    res.set('access-control-allow-headers', '*')
    next()
})
app.use('/', config)
app.use('/', signup)
app.use('/', request)
app.use('/', transition)

export default app
