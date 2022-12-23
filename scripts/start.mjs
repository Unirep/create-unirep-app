import { spawn, exec } from "child_process";
console.log("Starting a hardhat node...");
const hardhat = spawn("yarn contracts hardhat node", { shell: true });

hardhat.stdout.on("data", (data) => {
    // when start an Account list
    if (data.toString().indexOf("========") !== -1) {
        // deploy a Unirep contract and the attester contract
        exec("yarn contracts deploy", (err) => {
            if (err) {
                console.error(`Deploy contract error: ${err}`);
                process.exit(1);
            }
            console.log("Contract has been deployed");

            // start a relayer
            console.log("Start a relayer");
            const relay = spawn("yarn relay start", { shell: true });
            relay.stderr.on("data", (data) => {
                console.error(`Relay Error: ${data}`);
            });

            // start a frontend
            console.log("Start a frontend at http://localhost:3000");
            const frontend = spawn("yarn frontend start", { shell: true });
            frontend.stderr.on("data", (data) => {
                console.error(`Frontend Error: ${data}`);
            });
        });
    }
});

hardhat.stderr.on("data", (data) => {
    console.error(`hardhat stderr: ${data}`);
});
