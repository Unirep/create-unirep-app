require('@nomiclabs/hardhat-ethers')

module.exports = {
    defaultNetwork: 'hardhat',
    networks: {
        hardhat: {
            blockGasLimit: 12000000,
        },
        local: {
            chainId: 34567,
            url: 'http://localhost:8545',
            blockGasLimit: 12000000,
        },
    },
    solidity: {
        compilers: [
            {
                version: '0.8.17',
                settings: {
                    optimizer: { enabled: true, runs: 200 },
                },
            },
        ],
    },
}
