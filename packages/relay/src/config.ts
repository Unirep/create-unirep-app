import { config } from 'dotenv'
config()

export const UNIREP_ADDRESS = process.env.UNIREP_ADDRESS
export const APP_ADDRESS = process.env.APP_ADDRESS
export const ETH_PROVIDER_URL = process.env.ETH_PROVIDER_URL
export const PRIVATE_KEY = process.env.PRIVATE_KEY

export const DB_PATH = process.env.DB_PATH ?? ':memory:'
