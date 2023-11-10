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
exports.isTextChannel = void 0;
const express_1 = require("express");
const util_1 = require("../../../../../../util/src/index");
const lambert_server_1 = require("lambert-server");
const api_1 = require("../../../../index");
const multer_1 = __importDefault(require("multer"));
const typeorm_1 = require("typeorm");
const url_1 = require("url");
const router = (0, express_1.Router)();
exports.default = router;
function isTextChannel(type) {
    switch (type) {
        case util_1.ChannelType.GUILD_STORE:
        case util_1.ChannelType.GUILD_VOICE:
        case util_1.ChannelType.GUILD_STAGE_VOICE:
        case util_1.ChannelType.GUILD_CATEGORY:
            throw new lambert_server_1.HTTPError("not a text channel", 400);
        case util_1.ChannelType.DM:
        case util_1.ChannelType.GROUP_DM:
        case util_1.ChannelType.GUILD_NEWS:
        case util_1.ChannelType.GUILD_NEWS_THREAD:
        case util_1.ChannelType.GUILD_PUBLIC_THREAD:
        case util_1.ChannelType.GUILD_PRIVATE_THREAD:
        case util_1.ChannelType.GUILD_TEXT:
            return true;
    }
}
exports.isTextChannel = isTextChannel;
// https://discord.com/developers/docs/resources/channel#create-message
// get messages
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const channel_id = req.params.channel_id;
    const channel = yield util_1.Channel.findOneOrFail({ id: channel_id });
    if (!channel)
        throw new lambert_server_1.HTTPError("Channel not found", 404);
    isTextChannel(channel.type);
    const around = req.query.around ? `${req.query.around}` : undefined;
    const before = req.query.before ? `${req.query.before}` : undefined;
    const after = req.query.after ? `${req.query.after}` : undefined;
    const limit = Number(req.query.limit) || 50;
    if (limit < 1 || limit > 100)
        throw new lambert_server_1.HTTPError("limit must be between 1 and 100");
    var halfLimit = Math.floor(limit / 2);
    const permissions = yield (0, util_1.getPermission)(req.user_id, channel.guild_id, channel_id);
    permissions.hasThrow("VIEW_CHANNEL");
    if (!permissions.has("READ_MESSAGE_HISTORY"))
        return res.json([]);
    var query = {
        order: { id: "DESC" },
        take: limit,
        where: { channel_id },
        relations: ["author", "webhook", "application", "mentions", "mention_roles", "mention_channels", "sticker_items", "attachments"]
    };
    if (after)
        query.where.id = (0, typeorm_1.MoreThan)(after);
    else if (before)
        query.where.id = (0, typeorm_1.LessThan)(before);
    else if (around) {
        query.where.id = [
            (0, typeorm_1.MoreThan)((BigInt(around) - BigInt(halfLimit)).toString()),
            (0, typeorm_1.LessThan)((BigInt(around) + BigInt(halfLimit)).toString())
        ];
    }
    const messages = yield util_1.Message.find(query);
    const endpoint = util_1.Config.get().cdn.endpointPublic;
    return res.json(messages.map((x) => {
        var _a;
        (x.reactions || []).forEach((x) => {
            // @ts-ignore
            if ((x.user_ids || []).includes(req.user_id))
                x.me = true;
            // @ts-ignore
            delete x.user_ids;
        });
        // @ts-ignore
        if (!x.author)
            x.author = { discriminator: "0000", username: "Deleted User", public_flags: "0", avatar: null };
        (_a = x.attachments) === null || _a === void 0 ? void 0 : _a.forEach((x) => {
            // dynamically set attachment proxy_url in case the endpoint changed
            const uri = x.proxy_url.startsWith("http") ? x.proxy_url : `https://example.org${x.proxy_url}`;
            x.proxy_url = `${endpoint == null ? "" : endpoint}${new url_1.URL(uri).pathname}`;
        });
        return x;
    }));
}));
// TODO: config max upload size
const messageUpload = (0, multer_1.default)({
    limits: {
        fileSize: 1024 * 1024 * 100,
        fields: 10,
        files: 1
    },
    storage: multer_1.default.memoryStorage()
}); // max upload 50 mb
// TODO: dynamically change limit of MessageCreateSchema with config
// TODO: check: sum of all characters in an embed structure must not exceed 6000 characters
// https://discord.com/developers/docs/resources/channel#create-message
// TODO: text channel slowdown
// TODO: trim and replace message content and every embed field
// TODO: check allowed_mentions
// Send message
router.post("/", messageUpload.single("file"), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.payload_json) {
        req.body = JSON.parse(req.body.payload_json);
    }
    next();
}), (0, api_1.route)({ body: "MessageCreateSchema", permission: "SEND_MESSAGES" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { channel_id } = req.params;
    var body = req.body;
    const attachments = [];
    if (req.file) {
        try {
            const file = yield (0, util_1.uploadFile)(`/attachments/${req.params.channel_id}`, req.file);
            attachments.push(Object.assign(Object.assign({}, file), { proxy_url: file.url }));
        }
        catch (error) {
            return res.status(400).json(error);
        }
    }
    const channel = yield util_1.Channel.findOneOrFail({ where: { id: channel_id }, relations: ["recipients", "recipients.user"] });
    const embeds = [];
    if (body.embed)
        embeds.push(body.embed);
    let message = yield (0, api_1.handleMessage)(Object.assign(Object.assign({}, body), { type: 0, pinned: false, author_id: req.user_id, embeds,
        channel_id,
        attachments, edited_timestamp: undefined, timestamp: new Date() }));
    channel.last_message_id = message.id;
    if (channel.isDm()) {
        const channel_dto = yield util_1.DmChannelDTO.from(channel);
        // Only one recipients should be closed here, since in group DMs the recipient is deleted not closed
        Promise.all(channel.recipients.map((recipient) => {
            if (recipient.closed) {
                recipient.closed = false;
                return Promise.all([
                    recipient.save(),
                    (0, util_1.emitEvent)({
                        event: "CHANNEL_CREATE",
                        data: channel_dto.excludedRecipients([recipient.user_id]),
                        user_id: recipient.user_id
                    })
                ]);
            }
        }));
    }
    yield Promise.all([
        message.save(),
        (0, util_1.emitEvent)({ event: "MESSAGE_CREATE", channel_id: channel_id, data: message }),
        message.guild_id ? util_1.Member.update({ id: req.user_id, guild_id: message.guild_id }, { last_message_id: message.id }) : null,
        channel.save()
    ]);
    (0, api_1.postHandleMessage)(message).catch((e) => { }); // no await as it shouldnt block the message send function and silently catch error
    return res.json(message);
}));
