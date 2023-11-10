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
const util_1 = require("../../../../../util/src/index");
const api_1 = require("../../../index");
const express_1 = require("express");
const router = (0, express_1.Router)();
router.post("/", (0, api_1.route)({ permission: "SEND_MESSAGES" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { channel_id } = req.params;
    const user_id = req.user_id;
    const timestamp = Date.now();
    const channel = yield util_1.Channel.findOneOrFail({ id: channel_id });
    const member = yield util_1.Member.findOne({ where: { id: user_id, guild_id: channel.guild_id }, relations: ["roles", "user"] });
    yield (0, util_1.emitEvent)({
        event: "TYPING_START",
        channel_id: channel_id,
        data: Object.assign(Object.assign({}, (member ? { member: Object.assign(Object.assign({}, member), { roles: (_a = member === null || member === void 0 ? void 0 : member.roles) === null || _a === void 0 ? void 0 : _a.map((x) => x.id) }) } : null)), { channel_id,
            timestamp,
            user_id, guild_id: channel.guild_id })
    });
    res.sendStatus(204);
}));
exports.default = router;
