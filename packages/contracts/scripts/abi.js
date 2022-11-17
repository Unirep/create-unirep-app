const fs = require('fs')
const path = require('path')

const { abi } = require('../artifacts/contracts/UnirepApp.sol/UnirepApp.json')

fs.writeFileSync(
  path.join(__dirname, '../abi/UnirepApp.json'),
  JSON.stringify(abi)
)
