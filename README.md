> ⚠️ This bot can lead to loss of your funds, use at your own risk.

> This README is not complete. Try asking on [ARB Discord](https://discord.gg/wcxYzfKNaE) if you have any questions.

---

# Arb Jupiter Bot

[![ARB](https://img.shields.io/badge/ARB%20Protocol-%23000?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAA7EAAAOxAGVKw4bAAADo2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpBdHRyaWI9J2h0dHA6Ly9ucy5hdHRyaWJ1dGlvbi5jb20vYWRzLzEuMC8nPgogIDxBdHRyaWI6QWRzPgogICA8cmRmOlNlcT4KICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPgogICAgIDxBdHRyaWI6Q3JlYXRlZD4yMDIyLTA5LTAzPC9BdHRyaWI6Q3JlYXRlZD4KICAgICA8QXR0cmliOkV4dElkPjBkZjM2NDY4LTIxMTAtNDE4Ni1iYWMzLTMzNjdhOTk3NWI2MzwvQXR0cmliOkV4dElkPgogICAgIDxBdHRyaWI6RmJJZD41MjUyNjU5MTQxNzk1ODA8L0F0dHJpYjpGYklkPgogICAgIDxBdHRyaWI6VG91Y2hUeXBlPjI8L0F0dHJpYjpUb3VjaFR5cGU+CiAgICA8L3JkZjpsaT4KICAgPC9yZGY6U2VxPgogIDwvQXR0cmliOkFkcz4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6cGRmPSdodHRwOi8vbnMuYWRvYmUuY29tL3BkZi8xLjMvJz4KICA8cGRmOkF1dGhvcj5QYXdlxYIgTWlvZHVzemV3c2tpPC9wZGY6QXV0aG9yPgogPC9yZGY6RGVzY3JpcHRpb24+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczp4bXA9J2h0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8nPgogIDx4bXA6Q3JlYXRv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)](https://d1fdloi71mui9q.cloudfront.net/XwEquMSdQ19MdD3g8hRv_12jOVy4TGaJ9C0uo)
[![JupiterSDK](https://img.shields.io/badge/Jupiter%20SDK-v1-%2392EEF0?logo=data:image/png;base64,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)](https://docs.jup.sg/jupiter-core/jupiter-sdk/v1)
[![Twitter](https://img.shields.io/twitter/follow/ArbProtocol.svg?style=social&label=ArbProtocol)](https://twitter.com/ArbProtocol)
[![Discord](https://img.shields.io/discord/985095351293845514?logo=discord&logoColor=white&style=flat-square)](https://discord.gg/wcxYzfKNaE)

This bot is an open-source CLI tool that allows you to automate your crypto trading strategies on the Solana blockchain. The bot is currently written in JS and uses the [Jupiter SDK](https://docs.jup.ag/jupiter-core/jupiter-sdk/v1) to find routes and execute trades.

## nav

### [features](#features) · [CLI UI](#cli-ui) · ⚡️[install](#install) · [quickstart](#quickstart) · [tips](#some-tips-👀) · [hotkeys](#hotkeys) · [contributing](#contributing) · [license](#license) · [risk](#risk-disclaimer)

---

## features

- ✅ mainnet / devnet network support
- ✅ all **Jupiter Aggregator** coins
- ✅ easy to use **Config Wizard**
- ✅ CLI UI
- **Trading strategies**
  - ✅ Arbitrage strategy
  - ✅ PingPong strategy
  - [ ] limit swap\*
- **Slippage management**
  - ✅ `ProfitOrKill`
  - ✅ percentage % slippage
- **Profit management**
  - ✅ min profit % _(target)_
- **Charts**
  - ✅ latency chart
  - ✅ simulated profit chart
- **History & Statistics**
  - ✅ history of trades (CLI table)
  - ✅ statistics of all trades
  - [ ] export to CSV\*
- **Advanced**

  - ✅ custom UI colors
  - ✅ min. interval beetween iterations _(to avoid 429)_
  - [ ] switch betweem multiple RPCs\*
  - [ ] Telegram notifications \ monitoring\*
  - [ ] Telegram management\*

- ✅ hotkeys
- ✅ lots of fun
- [ ] bug free 🥲

\* not yet implemented / may never be implemented

There are two parts:

- config wizard
- trading bot

With Config wizard, you can easly setup your trading strategy.

# CLI UI

> ⚠️ EPILEPSY WARNING - CLI UI is constantly refreshed and may be disruptive for sensitive people

🔥 CLI UI helps you monitor your trading strategy with little impact on performance.

CLI UI currently displays a simulated profit chart and latency chart. The latency chart shows you the time taken to compute routes with Jupiter SDK.

All trades are stored in trades history and will be shown in the table. Table is limited to 5 entries, but history stores all trades.

💡 UI elements can be hidden or shown using [hotkeys](#hotkeys).

![](https://github.com/arbprotocol/solana-jupiter-bot/blob/main/.gif/wizard.gif)

![](https://github.com/arbprotocol/solana-jupiter-bot/blob/main/.gif/bot.gif)

![](https://github.com/arbprotocol/solana-jupiter-bot/blob/main/.gif/history.gif)

# install

> Please don't use `npm`, use `yarn` instead.

```bash
$ git clone https://github.com/arbprotocol/solana-jupiter-bot && cd solana-jupiter-bot
$ yarn
```

Set your wallet private key in the `.env` file

```js
SOLANA_WALLET_PRIVATE_KEY =
	hgq847chjjjJUPITERiiiISaaaAWESOMEaaANDiiiIwwWANNAbbbBErrrRICHh;
```

Set the default RPC
**_ARB Protocol RPC is used by default_**

```js
SOLANA_WALLET_PRIVATE_KEY=hgq847chjjjJUPITERiiiISaaaAWESOMEaaANDiiiIwwWANNAbbbBErrrRICHh
DEFAULT_RPC=https://my-super-lazy-rpc.gov
```

# quickstart

1. Clone this repo
2. Install dependencies
3. Set your wallet private key in the `.env` file
4. Run `yarn start` to start the Config Wizard
5. Follow the steps in the Config Wizard

```
  Usage:
    $ yarn start
      This will open Config Wizard and start the bot

    $ yarn trade
      Start Bot and Trade with latest config

    $ yarn wizard
      Start Config Wizard only
```

### some tips 👀

🔨 The bot is a Tool, not a holy grail that will make you rich just by running it. If you don't know what you are doing, you will lose money.

👉 RPC / Network speed & good trading strategy is the key to success.

🙉 Not everything is so obvious. eg. a larger trade size can lead to smaller profits than a lower trade size.

🛑 If you frequently get 429 errors, you should increase the `minInterval` in the config (`Advanced` step).

🥵 You want to `arbitrage` USDC or USDT? YES! Guess what? E V E R Y O N E wants to arbitrage USDC or USDT. If you don't have access to a super fancy RPC, there is a good chance you will end up with lots of 'Slippage errors'.

🥶 `SLIPPAGE ERRORS` are not bot errors. They are part of the Solana blockchain. If you want to avoid them you have to go with the super fancy RPC or pick the less popular pairs/coins - just try to find out which ones have options.

🏓 `PingPong` strategy is really poweful on sideways markets. Search through charts the coins that are constantly moving up and down.

🗡 `ProfitOrKill` slippage strategy is your smart seat belt. It will set the minimum output of the transaction to the last balance so you minimize the risk of losing money when the market moves against you. You always should get at least the amount from the previous trade \*_ofc you still pay the tx fees_

📡 If you can't run the bot, it's likely something wrong with the network, RPC, or config file.

😬 Don't like the intro? You can disable it in the .env file with `SKIP_INTRO=true`

· [back to top](#nav) ·

# hotkeys

While the bot is running, you can use some hotkeys that will change the behaviour of the bot or UI

`[H]` - show/hide Help

`[CTRL] + [C]` - obviously it will kill the bot

`[I]` - incognito RPC _Hide RPC address - helpful when streaming / screenshotting_

`[E]` - force execution with current setup & profit _*(may result in loss - you bypass all rules)*_

`[R]` - force execution, stop the bot _*(may result in loss - you bypass all rules)*_

`[L]` - show/hide latency chart (of Jupiter `computeRoutes()`)

`[P]` - show/hide profit chart

`[T]` - show/hide trade history table \*_table isn't working yet_

`[S]` - simulation mode switch (enable/disable trading)

· [back to top](#nav) ·

# trading strategies

    TODO

## arbitrage strategy

    TODO

## PingPong strategy

    TODO

· [back to top](#nav) ·

# slippage management

    TODO

## ProfitOrKill

It will set the minimum output of the transaction to the last balance so you minimize the risk of losing money when the market moves against you. You always should get at least the amount from the previous trade \*_ofc you still pay the tx fees_

## percentage slippage

Simple percentage slippage. The percentage slippage is calculated by the Jupiter SDK.

    TODO

· [back to top](#nav) ·

# profit management

    TODO

· [back to top](#nav) ·

# contributing

Arb Jupiter Bot is an open source project and contributions are welcome.

· [back to top](#nav) ·

# license

**MIT** yay! 🎉

· [back to top](#nav) ·

# risk disclaimer

This software is provided as is, without any warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and non-infringement. In no event shall the authors be liable for any claim, damages, or other liability.

· [back to top](#nav) ·

# supported tokens

| 🪙          | 🪙       | 🪙      | 🪙         | 🪙         | 🪙         | 🪙         | 🪙       |
| ----------- | -------- | ------- | ---------- | ---------- | ---------- | ---------- | -------- | --- |
| YAKU        | agEUR    | MBS     | CWAR       | VINU       | DIO        | HIPPO      | BLT      |     |
| CKG         | JSOL     | INU     | WIPE       | MINECRAFT  | NEKI       | SWOLE      | BOKU     |     |
| OOGI        | TRTLS    | MMaps   | SOLFI      | SLX        | BMBO       | FUM        | SLB      |     |
| SOLA        | SOL      | USDC    | IVN        | BTC        | soETH      | soYFI      | soLINK   |     |
| soSUSHI     | soALEPH  | soSXP   | soCREAM    | soAKRO     | soHXRO     | SRM        | soFTT    |     |
| soTOMO      | soGRT    | FIDA    | KIN        | MAPS       | OXY        | BRZ        | USDT     |     |
| RAY         | wCAPS_v1 | wFTT_v1 | AUDIO      | wHEX_v1    | wDAI_v1    | yPRT       | wFRAX_v1 |     |
| wLUNA_v1    | wBUSD_v1 | oDOP    | COPE       | ROPE       | MEDIA      | STEP       | xSTEP    |     |
| XSB         | COBAN    | QUEST   | SLIM       | SAMO       | PANDA      | ATLAS      | POLIS    |     |
| TCW         | SDOGE    | YARD    | SNY        | FROG       | MOLA       | SOLAPE     | WOOF     |     |
| MER         | APYS     | SOLPAD  | TULIP      | TYNA       | MGT        | CHEEMS     | CATO     |     |
| NINJA       | BOP      | DXL     | GRAPE      | CKC        | APEX       | SOLD       | ORCA     |     |
| SHILL       | FTR      | renBTC  | renDOGE    | renLUNA    | SAIL       | RIN        | SCY      |     |
| VCC         | OXS      | FAB     | POTATO     | STR        | GU         | SOLC       | LUNY     |     |
| DINO        | LIQ      | CRP     | SLRS       | JET        | WOO        | LIKE       | wUST_v1  |     |
| METAS       | Orbs     | C98     | SBR        | LRA        | wHBTC_v1   | wHUSD_v1   | wHAPI    |     |
| LARIX       | SSU      | sSOL    | mSOL       | PSOL       | PORT       | MNGO       | UPS      |     |
| gSAIL       | PAI      | PRT     | pBTC       | pSOL       | ULA        | SUNNY      | CYS      |     |
| stSOL       | wstETH   | KURO    | SYP        | CRY        | DINOEGG    | SMRT       | DATE     |     |
| CSTR        | apUSDT   | apUSDC  | SOLR       | SPWN       | SNS        | scnSOL     | SOLX     |     |
| ABR         | abBUSD   | aeWETH  | aeUSDT     | aeUSDC     | aeDAI      | acUSD      | cSOL     |     |
| cUSDC       | cUSDT    | LDO     | rSOL       | WET        | aeFTT      | MDF        | WAG      |     |
| SBNK        | MNDE     | DGLN    | xUSD       | xBTC       | xSOL       | xFTT       | xETH     |     |
| xLUNA       | UXD      | USDCet  | USDCpo     | USDTet     | USDTpo     | DAI        | HIMA     |     |
| FRKT        | aaUSDT   | aaUSDC  | aaDAI      | aaWBTC     | AVAX       | FRIES      | PNT      |     |
| FRNT        | AURY     | DOGO    | SOLPAY     | MSI        | SAO        | CAVE       | GOFX     |     |
| FTT         | UST      | ETH     | SRMet      | LUNA       | AVAX       | HUSD       | BUSDet   |     |
| FRAX        | HBTC     | USDK    | SUSHI      | UNI        | BNB        | LINK       | PAXG     |     |
| HXRO        | SXP      | OASIS   | SAMU       | acUSDC     | ahBTC      | ahUSDT     | BABY     |     |
| SLND        | SAMOL    | SHIBA   | UXP        | MARI🌱ANA  | USDCbs     | aSOL       | USDTbs   |     |
| ASGARD      | SER      | PU😸    | BITCH      | TICKET     | PART       | NOM        | KITTY    |     |
| MEND        | IN       | SHIB    | AXSet      | DYDX       | MATICpo    | BUSDbs     | KKO      |     |
| WAGMI       | SCT      | MODUL   | MANA       | SAND       | SOLBEAR    | CRAT       | SVIZ     |     |
| GENE        | SONAR    | FOXY    | BITXBIT    | GMSOL      | SOLAB      | PHY        | CCC      |     |
| ELU         | HIRAM    | GM      | ICE        | JUNGLE     | REAL       | APT        | THECA    |     |
| SINGULARITY | 1SOL     | WEENS   | CAPY       | MIMO       | POLE       | SEEDED     | CASH     |     |
| SPORE       | DFL      | STARS   | sUSDC-8    | sBTC-9     | sUSDT-9    | srenBTC-10 | sCASH-9  |     |
| srenBTC-9   | swFTT-9  | sFTT-9  | sUSDC-9    | swhETH-9   | srenLUNA-9 | sBTC-8     | sETH-8   |     |
| NANA        | BURD     | SCRAP   | TTT        | abUSDT     | abUSDC     | abBTCB     | abETH    |     |
| DAWG        | RLB      | pUSDC   | pUSDT      | sUSDT-8    | XTAG       | TRYB       | YORK     |     |
| TWT         | SNTR     | CRYY    | BOFB       | aeMIM      | aeFEI      | afBTC      | afETH    |     |
| afUSDC      | afDAI    | $FROG   | $KSH       | PIXL       | EYE        | FREN       | CHICKS   |     |
| SHARDS      | MARIO    | PUFF    | BANA       | RACEFI     | GST        | GMT        | SUCH     |     |
| UNQ         | FORA     | RUN     | PSK        | PCN        | BLOCK      | DAOJONES   | CHB      |     |
| TRYB        | $ASH     | FANI    | daoSOL     | SBABYDOGE  | FANT       | PAW        | BOT      |     |
| CRWNY       | BASIS    | VOID    | swtUST-9   | ppUSDC     | Zion       | KLUB       | SHDW     |     |
| CC          | FJBT     | $FORCE  | wDingocoin | SANTA      | MEAN       | DAPE       | WMP      |     |
| NOVA        | MKD      | FLWR    | SEI        | PTN        | DRAW       | BAIL       | CHP      |     |
| atUST       | acEUR    | SMBD    | BRWNDO     | MCAKE      | SOULO      | GOOSE      | TRPY     |     |
| DLN         | PRISM    | NOCH    | RAD        | $YETI      | WAV        | GGSG       | ALEPH    |     |
| COMP        | ATS      | PEOPLE  | HYPE       | MBC        | EGO        | bSOL       | LOOT     |     |
| BAPE        | BNTY     | CWM     | SDO        | SB         | AART       | GUANO      | SLC      |     |
| BMA         | SYXT     | TINY    | CRH        | creatorpro | pHONEY     | $WOOD      | MILK     |     |
| DGE         | GXE      | atLUNA  | TFBK       | CMFI       | CORE       | ILU        | NOS      |     |
| ARTZ        | MOONBURN | CCG     | SVT        | AMMO       | GARI       | VIVAION    | cMETA    |     |
| eSOL        | ACM      | BXS     | sCASH-8    | sagEUR-9   | sUST-8     | ARTE       | PSY      |     |
| SXS         | BUD      | CELO    | FTM        | SGEM       | FCON       | POZZ       | GYC      |     |
| $HONEY      | BORG     | sRLY    | 1SP        | BASIC      | LSTAR      | GODZ       | WHEY     |     |
| GMORNN      | UM       | SIXY    | BREA       | HBB        | DOOB       | SMCK       | ENC      |     |
| USDH        | BIT      | DAU     | ROLL       | DARC       | NAGA       | MAGA       | NFD      |     |
| POT         | PENNY    | MAI     | CHIPS      | ALIEN      | MONY       | TAKI       | DUST     |     |
| DEV         | SHUT     | MRX     | EDO        | $WNZ       | 9LIVES     | SD         | SOLI     |     |
| ORIA        | FUJI     | GMFC    | $POT       | SLDR       | GNOM       | GUARD      | EPOCH    |     |
| JFI         | cmSOL    | prtSOL  | $SPWX      | sUSD       | SPACEGOLD  | SOLP       | NESTA    |     |
| $PACES      | PEEL     | HONSHU  | FRTN       | HTO        | DOPIES     | CLAN       | DAB      |     |
| NRC         | JJJJC    | $ROBO   | ROL        | Miku       | T1NY       | BONE       | MALL     |     |
| RIBBET      | RICE     | HONE    | KROBA      | BONES      | FBZ        | CHIMP      | PLAYA    |     |
| RING        | KRILL    | NLTK    | WAS        | MMA        | MTP        | SPM        | MRTS     |     |
| HENDX       | XGLI     | FAC     | DELFI      | BLEEP      | DREAM      | SKULL      | CRAFT    |     |
| QUACK       | BOOTY    | PURR    | KAI        | GV         | DRGNZ      | LUST       | CYRUS    |     |
| SKUL        | IV       | KING    | $CRECK     | BNCE       | ssoFTT-8   | sLUNA-9    | PRGC     |     |
| wrBTC       | CRM      | SNAP    | JUNKz      | YAW        | TOCO       | THC        | WAVE     |     |
| JELLY       | DGNA     | GEAR    | FamSOL     | BLOOD      | SAC        | PERP       | FFF      |     |
| AUR         | GENO     | LIFL    | DGOD       | solUST     | THUGZ      | PLWAV      | AGVZ     |     |
| PREY        | NEAR     | GLXY    | $ALL       | BM         | WAVES      | HKDD       | BMT      |     |
| AIR         | CHI      | ZBC     | ACA        | TRIT       | TKMK       | WATT       | DKM      |     |
| SAFE        | MHC      | PRIME   | NOVAX      | HNYG       | SLCL       | RATIO      | ELIXIR   |     |
| MHCNWS      | WOOP     | ENRX    | FUNZ       | RAMENF     | NEST       | REAP       | SMRAI    |     |
| API         | BOFx     | WIZE    | USDr       | DISK       | HAWK       | MONGO      | ZAP      |     |
| IDOLZ       | $EGG     | ACF     | FEED       | $NEON      | FORGE      | PRANA      | VSNRY    |     |
| OOINK       | MOSHI    | ANA     | TTST       | CARTEL     | GLXY       | ERRA       | NIRV     |     |
| NNI         | UNKN     | ARNM    | JOINTS     | WOW        | MNRL       | sTZC       | $FLY     |     |
| PLD         | RPC      | PU238   | LFNTY      | xLFNTY     | ZIG        | NEO        | CSM      |     |
| LILY        | SIX      | WPUFF   | VAULT      | FLWRS      | DARK       | ENX        | CREAMY   |     |
| GEAR        | $LUV     | OTAKU   | DPAY       | $GARY      | HALO       | EMBER      | KTRC     |     |
| COCU        | TENKAI   | BTL     | DEDS       | USN        | PENNY      | fUSD       | USH      |     |
| HDG         | KS       | 44TH    | TROOP      | MONKES     | SURF       | sRLY       | calUSD   |     |
| TREN        | GOLDY    | PHNX    | HCOIN      | BBI        | AERA       | VIKN       | KSW      |     |
| VIBEZ       | FERO     | TGT     | WNDO       | BOO        | DRIPP      | rPWNG      | rPUNK    |     |
| rLGND       | rZOOM    | FINE    | MILK       | DKCOIN     | $STONE     | WEYU       | TRB      |     |
| TRUE        | XTR      | SSURF   | GB         | NECTAR2    | DMV        | ARB        | ICHIGO   |     |
| svtOKAY     | RIBH     | svtFFF  | svtSMB     | svtPSK     | svtDGOD    | svtVSNRY   | svtFLARE |     |
| svtGGSG     | svtCWM   | svtDAPE | svtBV      | KREECHURE  | svtTHUGZ   | svtGENE    | svtAURY  |     |
| $TLA        | DUSK     | CRM     | KI         | WEC        | AUT        | WHALES     | ZALINA   |     |
| IP3         | xALGO    | OKAYB   | MC         | BOXCH      | TAP        | KST        | KNK      |     |
| ATH         | JFI      | MARROW  | LSI        | PCPC       | NARK       | FRR        | ABC      |     |
| AHT         | PRIMATES | AFSeX   | INFX       | ENG        | SNAIL      | DAPE       | TAPES    |
