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
router.get("/", (0, api_1.route)({}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { guild_id } = req.params;
    yield util_1.Member.IsInGuildOrFail(req.user_id, guild_id);
    const emojis = yield util_1.Emoji.find({ where: { guild_id: guild_id }, relations: ["user"] });
    return res.json(emojis);
}));
router.get("/:emoji_id", (0, api_1.route)({}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { guild_id, emoji_id } = req.params;
    yield util_1.Member.IsInGuildOrFail(req.user_id, guild_id);
    const emoji = yield util_1.Emoji.findOneOrFail({ where: { guild_id: guild_id, id: emoji_id }, relations: ["user"] });
    return res.json(emoji);
}));
router.post("/", (0, api_1.route)({ body: "EmojiCreateSchema", permission: "MANAGE_EMOJIS_AND_STICKERS" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { guild_id } = req.params;
    const body = req.body;
    const id = util_1.Snowflake.generate();
    const emoji_count = yield util_1.Emoji.count({ guild_id: guild_id });
    const { maxEmojis } = util_1.Config.get().limits.guild;
    if (emoji_count >= maxEmojis)
        throw util_1.DiscordApiErrors.MAXIMUM_NUMBER_OF_EMOJIS_REACHED.withParams(maxEmojis);
    if (body.require_colons == null)
        body.require_colons = true;
    const user = yield util_1.User.findOneOrFail({ id: req.user_id });
    body.image = (yield (0, util_1.handleFile)(`/emojis/${id}`, body.image));
    const emoji = yield new util_1.Emoji(Object.assign(Object.assign({ id: id, guild_id: guild_id }, body), { user: user, managed: false, animated: false, available: true, roles: [] })).save();
    yield (0, util_1.emitEvent)({
        event: "GUILD_EMOJIS_UPDATE",
        guild_id: guild_id,
        data: {
            guild_id: guild_id,
            emojis: yield util_1.Emoji.find({ guild_id: guild_id })
        }
    });
    return res.status(201).json(emoji);
}));
router.patch("/:emoji_id", (0, api_1.route)({ body: "EmojiModifySchema", permission: "MANAGE_EMOJIS_AND_STICKERS" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { emoji_id, guild_id } = req.params;
    const body = req.body;
    const emoji = yield new util_1.Emoji(Object.assign(Object.assign({}, body), { id: emoji_id, guild_id: guild_id })).save();
    yield (0, util_1.emitEvent)({
        event: "GUILD_EMOJIS_UPDATE",
        guild_id: guild_id,
        data: {
            guild_id: guild_id,
            emojis: yield util_1.Emoji.find({ guild_id: guild_id })
        }
    });
    return res.json(emoji);
}));
router.delete("/:emoji_id", (0, api_1.route)({ permission: "MANAGE_EMOJIS_AND_STICKERS" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { emoji_id, guild_id } = req.params;
    yield util_1.Emoji.delete({
        id: emoji_id,
        guild_id: guild_id
    });
    yield (0, util_1.emitEvent)({
        event: "GUILD_EMOJIS_UPDATE",
        guild_id: guild_id,
        data: {
            guild_id: guild_id,
            emojis: yield util_1.Emoji.find({ guild_id: guild_id })
        }
    });
    res.sendStatus(204);
}));
exports.default = router;
