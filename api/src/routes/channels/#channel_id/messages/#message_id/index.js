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
const util_1 = require("../../../../../../../util/src/index");
const express_1 = require("express");
const api_1 = require("../../../../../index");
const api_2 = require("../../../../../index");
const router = (0, express_1.Router)();
// TODO: message content/embed string length limit
router.patch("/", (0, api_1.route)({ body: "MessageCreateSchema", permission: "SEND_MESSAGES" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { message_id, channel_id } = req.params;
    var body = req.body;
    const message = yield util_1.Message.findOneOrFail({ where: { id: message_id, channel_id }, relations: ["attachments"] });
    const permissions = yield (0, util_1.getPermission)(req.user_id, undefined, channel_id);
    if (req.user_id !== message.author_id) {
        permissions.hasThrow("MANAGE_MESSAGES");
        body = { flags: body.flags }; // admins can only suppress embeds of other messages
    }
    const new_message = yield (0, api_2.handleMessage)(Object.assign(Object.assign(Object.assign(Object.assign({}, message), { 
        // TODO: should message_reference be overridable?
        // @ts-ignore
        message_reference: message.message_reference }), body), { author_id: message.author_id, channel_id, id: message_id, edited_timestamp: new Date() }));
    yield Promise.all([
        new_message.save(),
        yield (0, util_1.emitEvent)({
            event: "MESSAGE_UPDATE",
            channel_id,
            data: Object.assign(Object.assign({}, new_message), { nonce: undefined })
        })
    ]);
    (0, api_2.postHandleMessage)(message);
    return res.json(message);
}));
// permission check only if deletes messagr from other user
router.delete("/", (0, api_1.route)({}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { message_id, channel_id } = req.params;
    const channel = yield util_1.Channel.findOneOrFail({ id: channel_id });
    const message = yield util_1.Message.findOneOrFail({ id: message_id });
    if (message.author_id !== req.user_id) {
        const permission = yield (0, util_1.getPermission)(req.user_id, channel.guild_id, channel_id);
        permission.hasThrow("MANAGE_MESSAGES");
    }
    yield util_1.Message.delete({ id: message_id });
    yield (0, util_1.emitEvent)({
        event: "MESSAGE_DELETE",
        channel_id,
        data: {
            id: message_id,
            channel_id,
            guild_id: channel.guild_id
        }
    });
    res.sendStatus(204);
}));
exports.default = router;
