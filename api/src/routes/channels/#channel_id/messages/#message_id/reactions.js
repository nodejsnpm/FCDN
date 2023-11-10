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
const api_1 = require("../../../../../index");
const express_1 = require("express");
const lambert_server_1 = require("lambert-server");
const typeorm_1 = require("typeorm");
const router = (0, express_1.Router)();
// TODO: check if emoji is really an unicode emoji or a prperly encoded external emoji
function getEmoji(emoji) {
    emoji = decodeURIComponent(emoji);
    const parts = emoji.includes(":") && emoji.split(":");
    if (parts)
        return {
            name: parts[0],
            id: parts[1]
        };
    return {
        id: undefined,
        name: emoji
    };
}
router.delete("/", (0, api_1.route)({ permission: "MANAGE_MESSAGES" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { message_id, channel_id } = req.params;
    const channel = yield util_1.Channel.findOneOrFail({ id: channel_id });
    yield util_1.Message.update({ id: message_id, channel_id }, { reactions: [] });
    yield (0, util_1.emitEvent)({
        event: "MESSAGE_REACTION_REMOVE_ALL",
        channel_id,
        data: {
            channel_id,
            message_id,
            guild_id: channel.guild_id
        }
    });
    res.sendStatus(204);
}));
router.delete("/:emoji", (0, api_1.route)({ permission: "MANAGE_MESSAGES" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { message_id, channel_id } = req.params;
    const emoji = getEmoji(req.params.emoji);
    const message = yield util_1.Message.findOneOrFail({ id: message_id, channel_id });
    const already_added = message.reactions.find((x) => (x.emoji.id === emoji.id && emoji.id) || x.emoji.name === emoji.name);
    if (!already_added)
        throw new lambert_server_1.HTTPError("Reaction not found", 404);
    message.reactions.remove(already_added);
    yield Promise.all([
        message.save(),
        (0, util_1.emitEvent)({
            event: "MESSAGE_REACTION_REMOVE_EMOJI",
            channel_id,
            data: {
                channel_id,
                message_id,
                guild_id: message.guild_id,
                emoji
            }
        })
    ]);
    res.sendStatus(204);
}));
router.get("/:emoji", (0, api_1.route)({ permission: "VIEW_CHANNEL" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { message_id, channel_id } = req.params;
    const emoji = getEmoji(req.params.emoji);
    const message = yield util_1.Message.findOneOrFail({ id: message_id, channel_id });
    const reaction = message.reactions.find((x) => (x.emoji.id === emoji.id && emoji.id) || x.emoji.name === emoji.name);
    if (!reaction)
        throw new lambert_server_1.HTTPError("Reaction not found", 404);
    const users = yield util_1.User.find({
        where: {
            id: (0, typeorm_1.In)(reaction.user_ids)
        },
        select: util_1.PublicUserProjection
    });
    res.json(users);
}));
router.put("/:emoji/:user_id", (0, api_1.route)({ permission: "READ_MESSAGE_HISTORY" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { message_id, channel_id, user_id } = req.params;
    if (user_id !== "@me")
        throw new lambert_server_1.HTTPError("Invalid user");
    const emoji = getEmoji(req.params.emoji);
    const channel = yield util_1.Channel.findOneOrFail({ id: channel_id });
    const message = yield util_1.Message.findOneOrFail({ id: message_id, channel_id });
    const already_added = message.reactions.find((x) => (x.emoji.id === emoji.id && emoji.id) || x.emoji.name === emoji.name);
    if (!already_added)
        req.permission.hasThrow("ADD_REACTIONS");
    if (emoji.id) {
        const external_emoji = yield util_1.Emoji.findOneOrFail({ id: emoji.id });
        if (!already_added)
            req.permission.hasThrow("USE_EXTERNAL_EMOJIS");
        emoji.animated = external_emoji.animated;
        emoji.name = external_emoji.name;
    }
    if (already_added) {
        if (already_added.user_ids.includes(req.user_id))
            return res.sendStatus(204); // Do not throw an error ¯\_(ツ)_/¯ as discord also doesn't throw any error
        already_added.count++;
    }
    else
        message.reactions.push({ count: 1, emoji, user_ids: [req.user_id] });
    yield message.save();
    const member = channel.guild_id && (yield util_1.Member.findOneOrFail({ id: req.user_id }));
    yield (0, util_1.emitEvent)({
        event: "MESSAGE_REACTION_ADD",
        channel_id,
        data: {
            user_id: req.user_id,
            channel_id,
            message_id,
            guild_id: channel.guild_id,
            emoji,
            member
        }
    });
    res.sendStatus(204);
}));
router.delete("/:emoji/:user_id", (0, api_1.route)({}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { message_id, channel_id, user_id } = req.params;
    const emoji = getEmoji(req.params.emoji);
    const channel = yield util_1.Channel.findOneOrFail({ id: channel_id });
    const message = yield util_1.Message.findOneOrFail({ id: message_id, channel_id });
    if (user_id === "@me")
        user_id = req.user_id;
    else {
        const permissions = yield (0, util_1.getPermission)(req.user_id, undefined, channel_id);
        permissions.hasThrow("MANAGE_MESSAGES");
    }
    const already_added = message.reactions.find((x) => (x.emoji.id === emoji.id && emoji.id) || x.emoji.name === emoji.name);
    if (!already_added || !already_added.user_ids.includes(user_id))
        throw new lambert_server_1.HTTPError("Reaction not found", 404);
    already_added.count--;
    if (already_added.count <= 0)
        message.reactions.remove(already_added);
    yield message.save();
    yield (0, util_1.emitEvent)({
        event: "MESSAGE_REACTION_REMOVE",
        channel_id,
        data: {
            user_id: req.user_id,
            channel_id,
            message_id,
            guild_id: channel.guild_id,
            emoji
        }
    });
    res.sendStatus(204);
}));
exports.default = router;
