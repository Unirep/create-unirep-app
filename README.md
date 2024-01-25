# create-unirep-app

This is a demo app of a [unirep](https://github.com/Unirep/Unirep) attester. In this demo app, users can request data from the example attester. After transition, user can prove how much data he has.

> See: [Users and Attesters](https://developer.unirep.io/docs/protocol/users-and-attesters)

## 1. Installation

```shell
npx create-unirep-app
```

Then `cd` into the directory that was created.

## 2 Develop locally

### 2.1 Build the files

```shell
yarn build
```

### 2.2 Start a node

```shell
yarn contracts hardhat node
```

### 2.3 Deploy smart contracts

in new terminal window, from root:

```shell
yarn contracts deploy
```

### 2.4 Start a relayer (backend)

```shell
yarn relay start
```

### 2.5 Start a frontend

in new terminal window, from root:

```shell
yarn frontend start
```

It will be running at: http://localhost:3000/

## 3. Linter

### 3.1 Format the code

```shell
yarn lint:fix
```

### 3.2 Check if the code is formatted

```shell
yarn lint:check
```

## 4. Deploy the app

### 4.1 Deploy smart contract

-   Edit the `packages/contracts/.env` after `yarn build`.
-   Get your `ETH_PROVIDER_URL` from [infura](https://www.infura.io/), [alchemy](https://alchemy.com/), or other provider services.
-   Get your `PRIVATE_KEY` and paste it in `.env` and start with `0x`.
-   Run
    ```sh
    yarn contracts deploy --network custom
    ```
    from root directory

### 4.2 Deploy to [Vercel](https://vercel.com/)

Vercel is a Frontend Cloud. You can easily deploy the frontend and relay service with Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Funirep%2Fcreate-unirep-app)

-   **Deploy serverless relay:**

    -   Click the `Deploy` button, and add the following settings:
    -   Go to Settings > Environment Variables
        set
        ```env
        PRIVATE_KEY=
        ETH_PROVIDER_URL=
        APP_ADDRESS=
        UNIREP_ADDRESS=
        ```
        from `packages/relay/.env`
    -   Redeploy the relay, you will get a `https://{RELAY_APP_NAME}.vercel.app` as the relay server.

-   **Deploy frontend:**
    -   Click the `Deploy` button and add the following settings:
    -   **Framework Preset:** `Create React App`
        **Build Command:** `yarn build`
        **Output Directory:** `packages/frontend/build`
        and remain other settings by default.
    -   Go to Setting > Environment Variables
        set
        ```env
        SERVER=https://{RELAY_APP_NAME}.vercel.app
        ```
        from the above deployment.
