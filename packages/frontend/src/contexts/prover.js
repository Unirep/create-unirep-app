import { SERVER } from '../config'

export default {
    verifyProof: async (
        circuitName,
        publicSignals,
        proof
    ) => {
        const snarkjs = await import(/* webpackPrefetch: true */ 'snarkjs')
        const url = new URL(`/build/${circuitName}.vkey.json`, SERVER)
        const vkey = await fetch(url.toString()).then((r) => r.json())
        return snarkjs.groth16.verify(vkey, publicSignals, proof)
    },
    genProofAndPublicSignals: async (
        circuitName,
        inputs
    ) => {
        const snarkjs = await import(/* webpackPrefetch: true */ 'snarkjs')
        const wasmUrl = new URL(`/build/${circuitName}.wasm`, SERVER)
        const wasm = await fetch(wasmUrl.toString()).then((r) =>
            r.arrayBuffer()
        )
        const zkeyUrl = new URL(`/build/${circuitName}.zkey`, SERVER)
        const zkey = await fetch(zkeyUrl.toString()).then((r) =>
            r.arrayBuffer()
        )
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
            inputs,
            new Uint8Array(wasm),
            new Uint8Array(zkey)
        )
        return { proof, publicSignals }
    },
}
