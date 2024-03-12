<p align="center">
    <h1 align="center">create-unirep-app</h1>
</p>

<p align="center">
    <a href="https://github.com/unirep/unirep">
        <img src="https://img.shields.io/badge/project-unirep-blue.svg?style=flat-square">
    </a>
    <a href="https://github.com/unirep/unirep/blob/master/LICENSE">
        <img alt="Github license" src="https://img.shields.io/github/license/unirep/unirep.svg?style=flat-square">
    </a>
    <a href="https://eslint.org/">
        <img alt="Linter eslint" src="https://img.shields.io/badge/linter-eslint-8080f2?style=flat-square&logo=eslint">
    </a>
    <a href="https://prettier.io/">
        <img alt="Code style prettier" src="https://img.shields.io/badge/code%20style-prettier-f8bc45?style=flat-square&logo=prettier">
    </a>
    <a href="https://dl.circleci.com/status-badge/redirect/gh/Unirep/create-unirep-app/tree/main">
        <img alt="Circle CI" src="https://img.shields.io/circleci/build/github/Unirep/create-unirep-app/main?style=flat-square">
    </a>
</p>

This is a demo app of a [unirep](https://github.com/Unirep/Unirep) attester. In this demo app, users can request data from the example [attester](https://developer.unirep.io/docs/protocol/users-and-attesters). After transition, users can prove how much data they have.

Learn more about [how to build with create-unirep-app](https://developer.unirep.io/docs/getting-started/create-unirep-app)!

## 🔋 Requirements

-   Node.js >=18
-   To write custom circuits: install [rust](https://www.rust-lang.org/tools/install) and [circom 2](https://docs.circom.io/getting-started/installation/)

## 🛠 1. Installation

```shell
npx create-unirep-app
```

Then `cd` into the directory that was created.

## 📦 2. Local Development

### 2.1 Build the files

```shell
yarn build
```

> [!TIP]
> To overwrite circuit keys, delete `.wasm`, `.zkey` and `.vkey.json` objects in `packages/circuits/zksnarkBuild` and run:
>
> ```shell
> yarn circuits buildsnark
> ```

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

## 🎁 3. Linting

### 3.1 Format the code

```shell
yarn lint:fix
```

### 3.2 Check if the code is formatted

```shell
yarn lint:check
```

## 🛜 4. Deployment

### 4.1 Deploy smart contract

-   Edit the `packages/contracts/.env` after `yarn build`.
-   Get your `ETH_PROVIDER_URL` from [infura](https://www.infura.io/), [alchemy](https://alchemy.com/), or other provider services.
-   Get your `PRIVATE_KEY` and paste it in `.env` starting with `0x`.
-   Run
    ```sh
    yarn contracts deploy --network custom
    ```
    from root directory

### 4.2 Deploy the frontend

[Vercel](https://vercel.com/) is a Frontend Cloud. You can easily deploy the frontend and relay service with Vercel.

> [!CAUTION]
> It will be a serverless relay. Learn more about [serverless functions](https://vercel.com/docs/functions/serverless-functions).

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
    -   View demo: https://create-unirep-app-relay.vercel.app/

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

        and leave other settings as default.

    -   Deploy the frontend, you will get a `https://{FRONTEND_APP_NAME}.vercel.app` app!
    -   View demo: https://create-unirep-app-frontend.vercel.app/

## 🙌🏻 Join our community

-   Discord server: <a href="https://discord.gg/VzMMDJmYc5"><img src="https://img.shields.io/discord/931582072152281188?label=Discord&style=flat-square&logo=discord"></a>
-   Twitter account: <a href="https://twitter.com/UniRep_Protocol"><img src="https://img.shields.io/twitter/follow/UniRep_Protocol?style=flat-square&logo=twitter"></a>
-   Telegram group: <a href="https://t.me/unirep"><img src="https://img.shields.io/badge/telegram-@unirep-blue.svg?style=flat-square&logo=telegram"></a>

## <img height="24" src="https://pse.dev/_next/static/media/header-logo.bf6fc8c1.svg"> Privacy & Scaling Explorations

This project is supported by [Privacy & Scaling Explorations](https://pse.dev/) and the Ethereum Foundation.
See more projects on: https://pse.dev/projects.
