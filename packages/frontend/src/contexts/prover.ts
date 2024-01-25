import * as snarkjs from 'snarkjs'
import { Circuit } from '@unirep/circuits'
import { KEY_SERVER } from '../config'

export default {
    verifyProof: async (
        circuitName: string | Circuit,
        publicSignals: snarkjs.PublicSignals,
        proof: snarkjs.Groth16Proof
    ) => {
        const url = `${KEY_SERVER}/${circuitName}.vkey.json`
        const r = await fetch(url.toString())
        if (!r.ok) {
            throw new Error(
                `Error fetching vkey from ${url}: ${await r.json()}`
            )
        }
        const vkey = await r.json()
        return snarkjs.groth16.verify(vkey, publicSignals, proof)
    },
    genProofAndPublicSignals: async (
        circuitName: string | Circuit,
        inputs: any
    ) => {
        const wasmUrl = `${KEY_SERVER}/${circuitName}.wasm`

        const wasmr = await fetch(wasmUrl.toString())
        if (!wasmr.ok) {
            throw new Error(
                `Error fetching vkey from ${wasmUrl}: ${await wasmr.json()}`
            )
        }
        const wasm = await wasmr.arrayBuffer()
        const zkeyUrl = `${KEY_SERVER}/${circuitName}.zkey`
        const zkeyr = await fetch(zkeyUrl.toString())
        if (!zkeyr.ok) {
            throw new Error(
                `Error fetching vkey from ${zkeyUrl}: ${await zkeyr.json()}`
            )
        }
        const zkey = await zkeyr.arrayBuffer()
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
            inputs,
            new Uint8Array(wasm),
            new Uint8Array(zkey)
        )
        return { proof, publicSignals }
    },
    /**
     * Get vkey from default built folder `zksnarkBuild/`
     * @param name Name of the circuit, which can be chosen from `Circuit`
     * @returns vkey of the circuit
     */
    getVKey: async (name: string | Circuit) => {
        // return require(path.join(buildPath, `${name}.vkey.json`))
    },
}
