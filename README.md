# create-unirep-app

This is a demo app of a [unirep](https://github.com/Unirep/Unirep) attester. In this demo app, users can request reputation from the example attester. After transition, user can prove how much reputation he has.

> See: [Users and Attesters](https://developer.unirep.io/docs/protocol/users-and-attesters)

## 1. Installation

```shell
npx create-unirep-app
```

Then `cd` into the directory that was created.

## 2. Start a node

```shell
yarn contracts hardhat node
```

## 3. Deploy smart contracts

in new terminal window, from root:

```shell
yarn contracts deploy
```

## 4. Start a relayer (backend)

```shell
yarn relay keys &&
yarn relay start
```

## 5. Start a frontend

in new terminal window, from root:

```shell
yarn frontend start
```

It will be running at: http://localhost:3000/
