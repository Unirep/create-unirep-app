import { spawn, exec } from 'child_process';
import fetch from 'node-fetch';
console.log('Starting a hardhat node...');
const providerURL = `http://localhost:8545`;
const serverURL = `http://localhost:8000`;
const frontendURL = `http://localhost:3000`;

const hardhat = spawn('yarn contracts hardhat node', { shell: true });
hardhat.stderr.on('data', (data) => {
    console.error(`hardhat stderr: ${data}`)
})
hardhat.on('close', (code) => {
    console.error(`hardhat exit with code: ${code}`);
    process.exit(code)
});
for (;;) {
    await new Promise((r) => setTimeout(r, 1000));
    try {
        await fetch(providerURL, { method: 'POST' }).catch(() => {});
        break;
    } catch (_) {}
}

// deploy a Unirep contract and the attester contract
await new Promise((rs, rj) =>
    exec('yarn contracts deploy', (err) =>
        err ? rj(err) : rs(console.log('Contract has been deployed'))
    )
);

// start relay
const relay = spawn('yarn relay start', { shell: true });
relay.stderr.on('data', (data) => {
    console.error(`relay stderr: ${data}`)
})
relay.stdout.on('data', (data) => {
    console.log(`${data}`)
})
relay.on('close', (code) => {
    console.error(`relay exit with code: ${code}`);
    hardhat.kill()
    process.exit(code)
});
for (;;) {
    await new Promise((r) => setTimeout(r, 1000));
    try {
        await fetch(serverURL, { method: 'POST' }).catch(() => {});
        break;
    } catch (_) {}
}
console.log('Relay started');

// start frontend
const frontend = spawn('yarn frontend start', { shell: true });
frontend.stderr.on('data', (data) => {
    console.error(`frontend stderr: ${data}`)
})
frontend.stdout.on('data', (data) => {
    console.log(`${data}`)
})
frontend.on('close', (code) => {
    console.error(`frontend exit with code: ${code}`);
    hardhat.kill()
    relay.kill()
    process.exit(code)
});
for (;;) {
    await new Promise((r) => setTimeout(r, 1000));
    try {
        await fetch(frontend, { method: 'POST' }).catch(() => {});
        break;
    } catch (_) {}
}
console.log(`Start a frontend at ${frontendURL}`);