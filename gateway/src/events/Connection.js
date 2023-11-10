"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Connection = void 0;
const Send_1 = require("../util/Send");
const Constants_1 = require("../util/Constants");
const Heartbeat_1 = require("../util/Heartbeat");
const Close_1 = require("./Close");
const Message_1 = require("./Message");
const zlib_1 = require("zlib");
const url_1 = require("url");
var erlpack;
try {
    erlpack = require("@yukikaze-bot/erlpack");
}
catch (error) { }
// TODO: check rate limit
// TODO: specify rate limit in config
// TODO: check msg max size
function Connection(socket, request) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // @ts-ignore
            socket.on("close", Close_1.Close);
            // @ts-ignore
            socket.on("message", Message_1.Message);
            console.log(`[Gateway] Connections: ${this.clients.size}`);
            const { searchParams } = new url_1.URL(`http://localhost${request.url}`);
            // @ts-ignore
            socket.encoding = searchParams.get("encoding") || "json";
            if (!["json", "etf"].includes(socket.encoding)) {
                if (socket.encoding === "etf" && erlpack) {
                    throw new Error("Erlpack is not installed: 'npm i @yukikaze-bot/erlpack'");
                }
                return socket.close(Constants_1.CLOSECODES.Decode_error);
            }
            // @ts-ignore
            socket.version = Number(searchParams.get("version")) || 8;
            if (socket.version != 8)
                return socket.close(Constants_1.CLOSECODES.Invalid_API_version);
            // @ts-ignore
            socket.compress = searchParams.get("compress") || "";
            if (socket.compress) {
                if (socket.compress !== "zlib-stream")
                    return socket.close(Constants_1.CLOSECODES.Decode_error);
                socket.deflate = (0, zlib_1.createDeflate)({ chunkSize: 65535 });
                socket.deflate.on("data", (chunk) => socket.send(chunk));
            }
            socket.events = {};
            socket.member_events = {};
            socket.permissions = {};
            socket.sequence = 0;
            (0, Heartbeat_1.setHeartbeat)(socket);
            yield (0, Send_1.Send)(socket, {
                op: Constants_1.OPCODES.Hello,
                d: {
                    heartbeat_interval: 1000 * 30,
                },
            });
            socket.readyTimeout = setTimeout(() => {
                return socket.close(Constants_1.CLOSECODES.Session_timed_out);
            }, 1000 * 30);
        }
        catch (error) {
            console.error(error);
            return socket.close(Constants_1.CLOSECODES.Unknown_error);
        }
    });
}
exports.Connection = Connection;
