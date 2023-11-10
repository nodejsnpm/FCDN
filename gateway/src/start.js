"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);
const Server_1 = require("./Server");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
var port = Number(process.env.PORT);
if (isNaN(port))
    port = 3002;
const server = new Server_1.Server({
    port,
});
server.start();
