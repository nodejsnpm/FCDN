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
router.put("/:message_id", (0, api_1.route)({ permission: "VIEW_CHANNEL" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { channel_id, message_id } = req.params;
    const message = yield util_1.Message.findOneOrFail({ id: message_id });
    // * in dm channels anyone can pin messages -> only check for guilds
    if (message.guild_id)
        req.permission.hasThrow("MANAGE_MESSAGES");
    const pinned_count = yield util_1.Message.count({ channel: { id: channel_id }, pinned: true });
    const { maxPins } = util_1.Config.get().limits.channel;
    if (pinned_count >= maxPins)
        throw util_1.DiscordApiErrors.MAXIMUM_PINS.withParams(maxPins);
    yield Promise.all([
        util_1.Message.update({ id: message_id }, { pinned: true }),
        (0, util_1.emitEvent)({
            event: "MESSAGE_UPDATE",
            channel_id,
            data: message
        }),
        (0, util_1.emitEvent)({
            event: "CHANNEL_PINS_UPDATE",
            channel_id,
            data: {
                channel_id,
                guild_id: message.guild_id,
                last_pin_timestamp: undefined
            }
        })
    ]);
    res.sendStatus(204);
}));
router.delete("/:message_id", (0, api_1.route)({ permission: "VIEW_CHANNEL" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { channel_id, message_id } = req.params;
    const channel = yield util_1.Channel.findOneOrFail({ id: channel_id });
    if (channel.guild_id)
        req.permission.hasThrow("MANAGE_MESSAGES");
    const message = yield util_1.Message.findOneOrFail({ id: message_id });
    message.pinned = false;
    yield Promise.all([
        message.save(),
        (0, util_1.emitEvent)({
            event: "MESSAGE_UPDATE",
            channel_id,
            data: message
        }),
        (0, util_1.emitEvent)({
            event: "CHANNEL_PINS_UPDATE",
            channel_id,
            data: {
                channel_id,
                guild_id: channel.guild_id,
                last_pin_timestamp: undefined
            }
        })
    ]);
    res.sendStatus(204);
}));
router.get("/", (0, api_1.route)({ permission: ["READ_MESSAGE_HISTORY"] }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { channel_id } = req.params;
    let pins = yield util_1.Message.find({ channel_id: channel_id, pinned: true });
    res.send(pins);
}));
exports.default = router;
