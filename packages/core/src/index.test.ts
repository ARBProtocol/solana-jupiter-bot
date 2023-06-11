import { expect, test } from "vitest";

import * as actions from "./index";

// TODO:!!!

test("exports actions", () => {
	expect(actions).toMatchInlineSnapshot(
		`
		{
		  "JupiterAggregator": {
		    "computeRoutes": [Function],
		    "init": [Function],
		  },
		  "PingPongStrategy": {
		    "id": "ping-pong",
		    "name": "Ping Pong",
		    "run": [Function],
		    "version": "0.0.1",
		  },
		  "PrismAggregator": {
		    "computeRoutes": [Function],
		    "init": [Function],
		  },
		  "createArray": [Function],
		  "createBot": [Function],
		  "createBotDeprecated": [Function],
		  "createStore": [Function],
		  "createJupiterClient": [Function],
		  "extendBot": [Function],
		  "loadPlugin": [Function],
		  "logger": Pino {
		    "debug": [Function],
		    "error": [Function],
		    "fatal": [Function],
		    "info": [Function],
		    "levels": {
		      "labels": {
		        "10": "trace",
		        "20": "debug",
		        "30": "info",
		        "40": "warn",
		        "50": "error",
		        "60": "fatal",
		      },
		      "values": {
		        "debug": 20,
		        "error": 50,
		        "fatal": 60,
		        "info": 30,
		        "trace": 10,
		        "warn": 40,
		      },
		    },
		    "onChild": [Function],
		    "silent": [Function],
		    "trace": [Function],
		    "warn": [Function],
		    Symbol(pino.useOnlyCustomLevels): false,
		    Symbol(pino.stream): SonicBoom {
		      "_asyncDrainScheduled": false,
		      "_bufs": [],
		      "_ending": false,
		      "_events": {
		        "error": [Function],
		        "newListener": [Function],
		      },
		      "_eventsCount": 2,
		      "_fsync": false,
		      "_hwm": 16387,
		      "_len": 0,
		      "_opening": false,
		      "_reopening": false,
		      "_writing": false,
		      "_writingBuf": "",
		      "append": true,
		      "destroyed": false,
		      "fd": 40,
		      "file": "./temp/bot.log",
		      "maxLength": 0,
		      "maxWrite": 16384,
		      "minLength": 0,
		      "mkdir": false,
		      "mode": undefined,
		      "release": [Function],
		      "retryEAGAIN": [Function],
		      "sync": false,
		    },
		    Symbol(pino.time): [Function],
		    Symbol(pino.timeSliceIndex): 8,
		    Symbol(pino.stringify): [Function],
		    Symbol(pino.stringifySafe): [Function],
		    Symbol(pino.stringifiers): {},
		    Symbol(pino.end): "}
		",
		    Symbol(pino.formatOpts): {
		      "stringify": [Function],
		    },
		    Symbol(pino.messageKey): "msg",
		    Symbol(pino.errorKey): "err",
		    Symbol(pino.nestedKey): null,
		    Symbol(pino.nestedKeyStr): "",
		    Symbol(pino.serializers): {
		      "err": [Function],
		    },
		    Symbol(pino.mixin): undefined,
		    Symbol(pino.mixinMergeStrategy): undefined,
		    Symbol(pino.chindings): "",
		    Symbol(pino.formatters): {
		      "bindings": [Function],
		      "level": [Function],
		      "log": undefined,
		    },
		    Symbol(pino.hooks): {
		      "logMethod": undefined,
		    },
		    Symbol(pino.msgPrefix): undefined,
		    Symbol(pino.lsCache): {
		      "10": "{\\"level\\":\\"trace\\"",
		      "20": "{\\"level\\":\\"debug\\"",
		      "30": "{\\"level\\":\\"info\\"",
		      "40": "{\\"level\\":\\"warn\\"",
		      "50": "{\\"level\\":\\"error\\"",
		      "60": "{\\"level\\":\\"fatal\\"",
		    },
		    Symbol(pino.levelVal): Infinity,
		  },
		  "loop": [Function],
		  "plugins": {
		    "withGreeter": [Function],
		  },
		}
	`
	);
});
