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
const express_1 = require("express");
const api_1 = require("../../../index");
const router = (0, express_1.Router)();
// TODO: delete channel
// TODO: Get channel
router.get("/", (0, api_1.route)({ permission: "VIEW_CHANNEL" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { channel_id } = req.params;
    const channel = yield util_1.Channel.findOneOrFail({ id: channel_id });
    return res.send(channel);
}));
router.delete("/", (0, api_1.route)({ permission: "MANAGE_CHANNELS" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { channel_id } = req.params;
    const channel = yield util_1.Channel.findOneOrFail({ where: { id: channel_id }, relations: ["recipients"] });
    if (channel.type === util_1.ChannelType.DM) {
        const recipient = yield util_1.Recipient.findOneOrFail({ where: { channel_id: channel_id, user_id: req.user_id } });
        recipient.closed = true;
        yield Promise.all([
            recipient.save(),
            (0, util_1.emitEvent)({ event: "CHANNEL_DELETE", data: channel, user_id: req.user_id })
        ]);
    }
    else if (channel.type === util_1.ChannelType.GROUP_DM) {
        yield util_1.Channel.removeRecipientFromChannel(channel, req.user_id);
    }
    else {
        yield Promise.all([
            util_1.Channel.delete({ id: channel_id }),
            (0, util_1.emitEvent)({ event: "CHANNEL_DELETE", data: channel, channel_id })
        ]);
    }
    res.send(channel);
}));
router.patch("/", (0, api_1.route)({ body: "ChannelModifySchema", permission: "MANAGE_CHANNELS" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var payload = req.body;
    const { channel_id } = req.params;
    if (payload.icon)
        payload.icon = yield (0, util_1.handleFile)(`/channel-icons/${channel_id}`, payload.icon);
    const channel = yield util_1.Channel.findOneOrFail({ id: channel_id });
    channel.assign(payload);
    yield Promise.all([
        channel.save(),
        (0, util_1.emitEvent)({
            event: "CHANNEL_UPDATE",
            data: channel,
            channel_id
        })
    ]);
    res.send(channel);
}));
exports.default = router;
