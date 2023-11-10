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
const util_1 = require("../../../../../util/src/index");
const api_1 = require("../../../index");
const router = (0, express_1.Router)();
router.put("/:user_id", (0, api_1.route)({}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { channel_id, user_id } = req.params;
    const channel = yield util_1.Channel.findOneOrFail({ where: { id: channel_id }, relations: ["recipients"] });
    if (channel.type !== util_1.ChannelType.GROUP_DM) {
        const recipients = [...channel.recipients.map((r) => r.user_id), user_id].unique();
        const new_channel = yield util_1.Channel.createDMChannel(recipients, req.user_id);
        return res.status(201).json(new_channel);
    }
    else {
        if (channel.recipients.map((r) => r.user_id).includes(user_id)) {
            throw util_1.DiscordApiErrors.INVALID_RECIPIENT; //TODO is this the right error?
        }
        channel.recipients.push(new util_1.Recipient({ channel_id: channel_id, user_id: user_id }));
        yield channel.save();
        yield (0, util_1.emitEvent)({
            event: "CHANNEL_CREATE",
            data: yield util_1.DmChannelDTO.from(channel, [user_id]),
            user_id: user_id
        });
        yield (0, util_1.emitEvent)({
            event: "CHANNEL_RECIPIENT_ADD",
            data: {
                channel_id: channel_id,
                user: yield util_1.User.findOneOrFail({ where: { id: user_id }, select: util_1.PublicUserProjection })
            },
            channel_id: channel_id
        });
        return res.sendStatus(204);
    }
}));
router.delete("/:user_id", (0, api_1.route)({}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { channel_id, user_id } = req.params;
    const channel = yield util_1.Channel.findOneOrFail({ where: { id: channel_id }, relations: ["recipients"] });
    if (!(channel.type === util_1.ChannelType.GROUP_DM && (channel.owner_id === req.user_id || user_id === req.user_id)))
        throw util_1.DiscordApiErrors.MISSING_PERMISSIONS;
    if (!channel.recipients.map((r) => r.user_id).includes(user_id)) {
        throw util_1.DiscordApiErrors.INVALID_RECIPIENT; //TODO is this the right error?
    }
    yield util_1.Channel.removeRecipientFromChannel(channel, user_id);
    return res.sendStatus(204);
}));
exports.default = router;
