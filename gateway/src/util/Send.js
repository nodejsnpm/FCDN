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
exports.Send = void 0;
var erlpack;
try {
    erlpack = require("@yukikaze-bot/erlpack");
}
catch (error) { }
function Send(socket, data) {
    return __awaiter(this, void 0, void 0, function* () {
        let buffer;
        if (socket.encoding === "etf")
            buffer = erlpack.pack(data);
        // TODO: encode circular object
        else if (socket.encoding === "json")
            buffer = JSON.stringify(data);
        else
            return;
        // TODO: compression
        if (socket.deflate) {
            socket.deflate.write(buffer);
            socket.deflate.flush();
            return;
        }
        return new Promise((res, rej) => {
            if (socket.readyState !== 1) {
                return rej("socket not open");
            }
            socket.send(buffer, (err) => {
                if (err)
                    return rej(err);
                return res(null);
            });
        });
    });
}
exports.Send = Send;
