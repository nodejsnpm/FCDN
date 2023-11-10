"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const Server_1 = require("./Server");
const server = new Server_1.CDNServer({ port: Number(process.env.PORT) || 3003 });
server
    .start()
    .then(() => {
    console.log("[Server] started on :" + server.options.port);
})
    .catch((e) => console.error("[Server] Error starting: ", e));
module.exports = server;
