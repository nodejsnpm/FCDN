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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
require("missing-native-js-functions");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const util_1 = require("../../util/src/index");
const ws_1 = __importDefault(require("ws"));
const Connection_1 = require("./events/Connection");
const http_1 = __importDefault(require("http"));
class Server {
    constructor({ port, server, production, }) {
        this.port = port;
        this.production = production || false;
        if (server)
            this.server = server;
        else {
            this.server = http_1.default.createServer(function (req, res) {
                res.writeHead(200).end("Online");
            });
        }
        this.server.on("upgrade", (request, socket, head) => {
            // @ts-ignore
            this.ws.handleUpgrade(request, socket, head, (socket) => {
                this.ws.emit("connection", socket, request);
            });
        });
        this.ws = new ws_1.default.Server({
            maxPayload: 4096,
            noServer: true,
        });
        this.ws.on("connection", Connection_1.Connection);
        this.ws.on("error", console.error);
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, util_1.initDatabase)();
            yield util_1.Config.init();
            yield (0, util_1.initEvent)();
            if (!this.server.listening) {
                this.server.listen(this.port);
                console.log(`[Gateway] online on 0.0.0.0:${this.port}`);
            }
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            (0, util_1.closeDatabase)();
            this.server.close();
        });
    }
}
exports.Server = Server;
