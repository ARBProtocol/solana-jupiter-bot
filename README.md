> ⚠️ This bot can lead to loss of your funds, use at your own risk.

> WIP - WIP - WIP - WIP -- 2.0.0-alpha.5 -- WIP - WIP - WIP - WIP

[![](https://img.shields.io/badge/License-MIT-brightgreen)](#license)
[![Twitter](https://img.shields.io/twitter/follow/ArbProtocol.svg?style=social&label=ArbProtocol)](https://twitter.com/ArbProtocol)
[![Discord](https://img.shields.io/discord/985095351293845514?logo=discord&logoColor=white&style=flat-square)](https://discord.gg/wcxYzfKNaE)

# install (production)

For most users it is recommended to use the .zip release. You can find them on our discord.

```bash
$ pnpm create-standalone

# unzip the file
# cd into the unzipped folder

# use any package manager you like to install dependencies
$ yarn|npm|pnpm install

# * build should be done automatically, but if it's not, run:
$ yarn|npm|pnpm build

# run the bot
$ yarn|npm|pnpm start

# use the wizard to update config.json file
$ yarn|npm|pnpm wizard
```

# install (development)

```bash
# if you don't have pnpm installed
$ npm i -g pnpm

# clone the repo and install dependencies
$ git clone -b 2.0.0-alpha https://github.com/ARBProtocol/solana-jupiter-bot.git
$ cd solana-jupiter-bot
$ pnpm i
```

# Usage

```
$ pnpm start
  | This will (turbo) build && run the bot.
  ! If ./config.json is not present, it will run wizard before starting the bot.

$ pnpm start:debug
  | This will (turbo) build && run the bot in debug mode.
  | You can find logs in ./temp/bot.log folder.

$ pnpm wizard
  | This will run the wizard to create ./config.json file.
  ! NOTE: This will not build or run the bot.

# Alternatively you can run the bot from the apps/arb-solana-bot directly
$ cd apps/arb-solana-bot && yarn|npm|pnpm start
  | This will run the bot.
  ! NOTE: This will not build the bot, so you need to build it first.

```

# Project info

> For now it will only run ping-pong strategy.

Written in TypeScript. [Turborepo](https://turbo.build/) is used to manage this project as a monorepo.
The project is split into /apps and /packages.

Recommended OS:

- MacOS
- Linux

Recommended Terminal:

- [Warp](https://www.warp.dev/)
- Default MacOS Terminal

> recommendations are based on personal experience. If you are using something else and it works well, please let us know on Discord or update Readme and create a PR.

## /apps

### @arb-protocol/arb-solana-bot

This is the main bot app that combines all packages together.

## /packages

### @arb-protocol/core

The core of the bot. Contains main logic and default strategies. This core provides API that can be consumed to create custom bot variations.
Currently the bot utilizes 1 aggregator: [Jupiter](https://jup.ag/) Core.
The goal here is to make it as `headless` as possible. There are plans to include [PRISM](https://prism.ag/) aggregator.

### @arb-protocol/tui

TUI - Interactive Terminal User Interface for the bot. It is used to display bot status and control it.

### @arb-protocol/wizard

Wizard is used to create config.json file, which is used to configure the bot.

### @arb-protocol/ts-config (private)

Common tsconfig base for all packages.

### @arb-protocol/eslint-config (private)

Common eslint config base for all packages.

# Contributors

Contributions are welcome! Please join our [Discord](https://discord.gg/wcxYzfKNaE) if you are interested in contributing. This is the main place where we discuss the project.

# known issues

- Windows 10 users might have some ridiculous issues like with the `cp` command. Please report them on Discord. We will try to help you but it's not a priority for us at the moment.
