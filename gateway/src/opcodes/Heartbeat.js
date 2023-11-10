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
exports.onHeartbeat = void 0;
const Heartbeat_1 = require("../util/Heartbeat");
const Send_1 = require("../util/Send");
function onHeartbeat(data) {
    return __awaiter(this, void 0, void 0, function* () {
        // TODO: validate payload
        (0, Heartbeat_1.setHeartbeat)(this);
        yield (0, Send_1.Send)(this, { op: 11 });
    });
}
exports.onHeartbeat = onHeartbeat;
