import hardhat from 'hardhat'
const { ethers } = hardhat
import { deployUnirep } from "@unirep/contracts/deploy/index.js"
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const UnirepApp = require("../abi/UnirepApp.json")

const [signer] = await ethers.getSigners()
const unirep = await deployUnirep(signer)
const epochLength = 100

const App = await ethers.getContractFactory('UnirepApp');
const app = await App.deploy(unirep.address, epochLength);

await app.deployed();

console.log(`Unirep app with epoch length ${epochLength} deployed to ${app.address}`);
