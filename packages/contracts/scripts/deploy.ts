import { ethers } from "ethers";
import { deployUnirep } from "@unirep/contracts/deploy"
import UnirepApp from "../artifacts/contracts/UnirepApp.sol/UnirepApp.json"

const PROVIDER = "http://127.0.0.1:8545/"
const provider = new ethers.providers.JsonRpcProvider(PROVIDER)
const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

async function main() {
  const signer = new ethers.Wallet(privateKey, provider)
  const unirep = await deployUnirep(signer)
  const epochLength = 100

  const App = new ethers.ContractFactory(UnirepApp.abi, UnirepApp.bytecode, signer);
  const app = await App.deploy(unirep.address, epochLength);

  await app.deployed();

  console.log(`Unirep app with epoch length ${epochLength} deployed to ${app.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
