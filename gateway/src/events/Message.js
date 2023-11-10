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
exports.Message = void 0;
const Constants_1 = require("../util/Constants");
var erlpack;
try {
    erlpack = require("@yukikaze-bot/erlpack");
}
catch (error) { }
const opcodes_1 = __importDefault(require("../opcodes"));
const lambert_server_1 = require("lambert-server");
const instanceOf_1 = require("../opcodes/instanceOf");
const PayloadSchema = {
    op: Number,
    $d: new lambert_server_1.Tuple(Object, Number),
    $s: Number,
    $t: String,
};
function Message(buffer) {
    return __awaiter(this, void 0, void 0, function* () {
        // TODO: compression
        var data;
        if (this.encoding === "etf" && buffer instanceof Buffer)
            data = erlpack.unpack(buffer);
        else if (this.encoding === "json" && typeof buffer === "string")
            data = JSON.parse(buffer);
        else
            return;
        instanceOf_1.check.call(this, PayloadSchema, data);
        // @ts-ignore
        const OPCodeHandler = opcodes_1.default[data.op];
        if (!OPCodeHandler) {
            console.error("[Gateway] Unkown opcode " + data.op);
            // TODO: if all opcodes are implemented comment this out:
            // this.close(CLOSECODES.Unknown_opcode);
            return;
        }
        try {
            return yield OPCodeHandler.call(this, data);
        }
        catch (error) {
            console.error(error);
            if (!this.CLOSED && this.CLOSING)
                return this.close(Constants_1.CLOSECODES.Unknown_error);
        }
    });
}
exports.Message = Message;
