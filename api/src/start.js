"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);
require("missing-native-js-functions");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const Server_1 = require("./Server");
const cluster_1 = __importDefault(require("cluster"));
const os_1 = __importDefault(require("os"));
const cores = Number(process.env.THREADS) || os_1.default.cpus().length;
if (cluster_1.default.isMaster && process.env.NODE_ENV == "production") {
    console.log(`Primary ${process.pid} is running`);
    // Fork workers.
    for (let i = 0; i < cores; i++) {
        cluster_1.default.fork();
    }
    cluster_1.default.on("exit", (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died, restart worker`);
        cluster_1.default.fork();
    });
}
else {
    var port = Number(process.env.PORT) || 3001;
    const server = new Server_1.FosscordServer({ port });
    server.start().catch(console.error);
    // @ts-ignore
    global.server = server;
}
