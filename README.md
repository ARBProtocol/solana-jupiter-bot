# WIP - THIS IS A VERY RAW DEV VERSION

![](https://github.com/ARBProtocol/solana-jupiter-bot/blob/dev-1.0.0-alpha/.gifs/very-important-image.jpg)

# install

```bash
# if you don't have pnpm installed
$ npm i -g pnpm

# clone the repo and install dependencies
$ git clone -b dev-1.0.0-alpha https://github.com/ARBProtocol/solana-jupiter-bot.git
$ cd solana-jupiter-bot
$ pnpm i
```

For now it will only run ping-pong strategy for testing purposes.

# hacking

```
  Usage:
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

# known issues
