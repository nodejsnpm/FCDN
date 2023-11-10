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
const express_1 = require("express");
const util_1 = require("../../../../../../util/src/index");
const lambert_server_1 = require("lambert-server");
const api_1 = require("../../../../index");
const router = (0, express_1.Router)();
exports.default = router;
// TODO: should users be able to bulk delete messages or only bots?
// TODO: should this request fail, if you provide messages older than 14 days/invalid ids?
// https://discord.com/developers/docs/resources/channel#bulk-delete-messages
router.post("/", (0, api_1.route)({ body: "BulkDeleteSchema" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { channel_id } = req.params;
    const channel = yield util_1.Channel.findOneOrFail({ id: channel_id });
    if (!channel.guild_id)
        throw new lambert_server_1.HTTPError("Can't bulk delete dm channel messages", 400);
    const permission = yield (0, util_1.getPermission)(req.user_id, channel === null || channel === void 0 ? void 0 : channel.guild_id, channel_id);
    permission.hasThrow("MANAGE_MESSAGES");
    const { maxBulkDelete } = util_1.Config.get().limits.message;
    const { messages } = req.body;
    if (messages.length < 2)
        throw new lambert_server_1.HTTPError("You must at least specify 2 messages to bulk delete");
    if (messages.length > maxBulkDelete)
        throw new lambert_server_1.HTTPError(`You cannot delete more than ${maxBulkDelete} messages`);
    yield util_1.Message.delete(messages.map((x) => ({ id: x })));
    yield (0, util_1.emitEvent)({
        event: "MESSAGE_DELETE_BULK",
        channel_id,
        data: { ids: messages, channel_id, guild_id: channel.guild_id }
    });
    res.sendStatus(204);
}));
