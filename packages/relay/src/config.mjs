import { ethers } from 'ethers'
import { config } from 'dotenv'
config()

export const UNIREP_ADDRESS = process.env.UNIREP_ADDRESS ?? '0xb7f8bc63bbcad18155201308c8f3540b07f84f5e'
export const APP_ADDRESS = process.env.APP_ADDRESS ?? '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0'
export const ETH_PROVIDER_URL = process.env.ETH_PROVIDER_URL ?? 'http://127.0.0.1:8545/'
export const PRIVATE_KEY = process.env.PRIVATE_KEY ?? '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'

export const DB_PATH = process.env.DB_PATH ?? ':memory:'

export const provider = ETH_PROVIDER_URL.startsWith('http') ? new ethers.providers.JsonRpcProvider(ETH_PROVIDER_URL) : new ethers.providers.WebSocketProvider(ETH_PROVIDER_URL)
