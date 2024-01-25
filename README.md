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

> [!CAUTION]
> It will be a serverless relay, learn more about [serverless functions](https://vercel.com/docs/functions/serverless-functions)

-   **Deploy serverless relay:**

    -   <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FUnirep%2Fcreate-unirep-app%2Ftree%2Feasy-deploy"><img src="https://vercel.com/button" alt="Deploy with Vercel"/></a><br/>
        Click the `Deploy` button, and add the following settings
    -   Go to **Settings > Environment Variables**<br/>
        set<br/>
        | key | value |
        |--|--|
        | `PRIVATE_KEY` | 0x... |
        | `ETH_PROVIDER_URL` |https://... |
        | `APP_ADDRESS` | 0x... |
        | `UNIREP_ADDRESS` | 0x... |

        from `packages/relay/.env`

    -   Go to **Deployments**, choose the deployment and click ...<br/>
        Click **Redeploy**
    -   Redeploy the relay, you will get a `https://{RELAY_APP_NAME}.vercel.app` as the relay server.

-   **Deploy frontend:**

    -   Go to vercel [dashboard](https://vercel.com/dashboard) and click **Add New... > Project**
    -   Choose the same repo as you created before.
    -   Set <br/>
        **Framework Preset:** `Create React App`<br/>
        **Build Command:** `yarn build`<br/>
        **Output Directory:** `packages/frontend/build`<br/>
        **Environment Variables:**
        | key | value |
        |--|--|
        | `SERVER` |`https://{RELAY_APP_NAME}.vercel.app` |

        and remain other settings by default.

    -   Deploy the frontend, you will get a `https://{FRONTEND_APP_NAME}.vercel.app` app!
