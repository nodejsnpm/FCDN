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
exports.sendMessage = exports.postHandleMessage = exports.handleMessage = void 0;
const util_1 = require("../../../util/src/index");
const lambert_server_1 = require("lambert-server");
const node_fetch_1 = __importDefault(require("node-fetch"));
const cheerio_1 = __importDefault(require("cheerio"));
// TODO: check webhook, application, system author, stickers
// TODO: embed gifs/videos/images
const LINK_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
const DEFAULT_FETCH_OPTIONS = {
    redirect: "follow",
    follow: 1,
    headers: {
        "user-agent": "Mozilla/5.0 (compatible; Fosscord/1.0; +https://github.com/fosscord/fosscord)"
    },
    size: 1024 * 1024 * 1,
    compress: true,
    method: "GET"
};
function handleMessage(opts) {
    var _a, _b, _c, _d, _e;
    return __awaiter(this, void 0, void 0, function* () {
        const channel = yield util_1.Channel.findOneOrFail({ where: { id: opts.channel_id }, relations: ["recipients"] });
        if (!channel || !opts.channel_id)
            throw new lambert_server_1.HTTPError("Channel not found", 404);
        const message = new util_1.Message(Object.assign(Object.assign({}, opts), { sticker_items: (_a = opts.sticker_ids) === null || _a === void 0 ? void 0 : _a.map((x) => ({ id: x })), guild_id: channel.guild_id, channel_id: opts.channel_id, attachments: opts.attachments || [], embeds: opts.embeds || [], reactions: /*opts.reactions ||*/ [], type: (_b = opts.type) !== null && _b !== void 0 ? _b : 0 }));
        // TODO: are tts messages allowed in dm channels? should permission be checked?
        if (opts.author_id) {
            message.author = yield util_1.User.getPublicUser(opts.author_id);
        }
        if (opts.application_id) {
            message.application = yield util_1.Application.findOneOrFail({ id: opts.application_id });
        }
        if (opts.webhook_id) {
            message.webhook = yield util_1.Webhook.findOneOrFail({ id: opts.webhook_id });
        }
        const permission = yield (0, util_1.getPermission)(opts.author_id, channel.guild_id, opts.channel_id);
        permission.hasThrow("SEND_MESSAGES");
        if (permission.cache.member) {
            message.member = permission.cache.member;
        }
        if (opts.tts)
            permission.hasThrow("SEND_TTS_MESSAGES");
        if (opts.message_reference) {
            permission.hasThrow("READ_MESSAGE_HISTORY");
            if (opts.message_reference.guild_id !== channel.guild_id)
                throw new lambert_server_1.HTTPError("You can only reference messages from this guild");
            if (opts.message_reference.channel_id !== opts.channel_id)
                throw new lambert_server_1.HTTPError("You can only reference messages from this channel");
            // TODO: should be checked if the referenced message exists?
            // @ts-ignore
            message.type = util_1.MessageType.REPLY;
        }
        // TODO: stickers/activity
        if (!opts.content && !((_c = opts.embeds) === null || _c === void 0 ? void 0 : _c.length) && !((_d = opts.attachments) === null || _d === void 0 ? void 0 : _d.length) && !((_e = opts.sticker_ids) === null || _e === void 0 ? void 0 : _e.length)) {
            throw new lambert_server_1.HTTPError("Empty messages are not allowed", 50006);
        }
        var content = opts.content;
        var mention_channel_ids = [];
        var mention_role_ids = [];
        var mention_user_ids = [];
        var mention_everyone = false;
        if (content) {
            message.content = content.trim();
            for (const [_, mention] of content.matchAll(util_1.CHANNEL_MENTION)) {
                if (!mention_channel_ids.includes(mention))
                    mention_channel_ids.push(mention);
            }
            for (const [_, mention] of content.matchAll(util_1.USER_MENTION)) {
                if (!mention_user_ids.includes(mention))
                    mention_user_ids.push(mention);
            }
            yield Promise.all(Array.from(content.matchAll(util_1.ROLE_MENTION)).map(([_, mention]) => __awaiter(this, void 0, void 0, function* () {
                const role = yield util_1.Role.findOneOrFail({ id: mention, guild_id: channel.guild_id });
                if (role.mentionable || permission.has("MANAGE_ROLES")) {
                    mention_role_ids.push(mention);
                }
            })));
            if (permission.has("MENTION_EVERYONE")) {
                mention_everyone = !!content.match(util_1.EVERYONE_MENTION) || !!content.match(util_1.HERE_MENTION);
            }
        }
        message.mention_channels = mention_channel_ids.map((x) => new util_1.Channel({ id: x }));
        message.mention_roles = mention_role_ids.map((x) => new util_1.Role({ id: x }));
        message.mentions = mention_user_ids.map((x) => new util_1.User({ id: x }));
        message.mention_everyone = mention_everyone;
        // TODO: check and put it all in the body
        return message;
    });
}
exports.handleMessage = handleMessage;
// TODO: cache link result in db
function postHandleMessage(message) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        var links = (_a = message.content) === null || _a === void 0 ? void 0 : _a.match(LINK_REGEX);
        if (!links)
            return;
        const data = Object.assign({}, message);
        data.embeds = data.embeds.filter((x) => x.type !== "link");
        links = links.slice(0, 5); // embed max 5 links
        for (const link of links) {
            try {
                const request = yield (0, node_fetch_1.default)(link, DEFAULT_FETCH_OPTIONS);
                const text = yield request.text();
                const $ = cheerio_1.default.load(text);
                const title = $('meta[property="og:title"]').attr("content");
                const provider_name = $('meta[property="og:site_name"]').text();
                const author_name = $('meta[property="article:author"]').attr("content");
                const description = $('meta[property="og:description"]').attr("content") || $('meta[property="description"]').attr("content");
                const image = $('meta[property="og:image"]').attr("content");
                const url = $('meta[property="og:url"]').attr("content");
                // TODO: color
                const embed = {
                    provider: {
                        url: link,
                        name: provider_name
                    }
                };
                if (author_name)
                    embed.author = { name: author_name };
                if (image)
                    embed.thumbnail = { proxy_url: image, url: image };
                if (title)
                    embed.title = title;
                if (url)
                    embed.url = url;
                if (description)
                    embed.description = description;
                if (title || description) {
                    data.embeds.push(embed);
                }
            }
            catch (error) { }
        }
        yield Promise.all([
            (0, util_1.emitEvent)({
                event: "MESSAGE_UPDATE",
                channel_id: message.channel_id,
                data
            }),
            util_1.Message.update({ id: message.id, channel_id: message.channel_id }, data)
        ]);
    });
}
exports.postHandleMessage = postHandleMessage;
function sendMessage(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = yield handleMessage(Object.assign(Object.assign({}, opts), { timestamp: new Date() }));
        yield Promise.all([
            util_1.Message.insert(message),
            (0, util_1.emitEvent)({ event: "MESSAGE_CREATE", channel_id: opts.channel_id, data: message.toJSON() })
        ]);
        postHandleMessage(message).catch((e) => { }); // no await as it shouldnt block the message send function and silently catch error
        return message;
    });
}
exports.sendMessage = sendMessage;
