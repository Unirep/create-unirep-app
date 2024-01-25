import '@typechain/hardhat'
import '@nomiclabs/hardhat-ethers'
import { config } from 'dotenv'
config()

export default {
    defaultNetwork: 'local',
    networks: {
        hardhat: {
            blockGasLimit: 12000000,
        },
        local: {
            url: 'http://127.0.0.1:8545',
            blockGasLimit: 12000000,
            accounts: [
                '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
            ],
        },
        custom: {
            url: process.env.ETH_PROVIDER_URL,
            accounts: [process.env.PRIVATE_KEY],
        },
    },
    solidity: {
        compilers: [
            {
                version: '0.8.17',
                settings: {
                    optimizer: { enabled: true, runs: 999999 },
                },
            },
        ],
    },
}
