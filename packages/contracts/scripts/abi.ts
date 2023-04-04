import * as fs from 'fs'
import * as path from 'path'
import UNIREP_APP_ABI from '../artifacts/contracts/UnirepApp.sol/UnirepApp.json'

fs.writeFileSync(
    path.join(__dirname, '../abi/UnirepApp.json'),
    JSON.stringify(UNIREP_APP_ABI.abi)
)
