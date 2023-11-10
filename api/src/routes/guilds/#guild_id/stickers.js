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
exports.getStickerFormat = void 0;
const util_1 = require("../../../../../util/src/index");
const express_1 = require("express");
const api_1 = require("../../../index");
const multer_1 = __importDefault(require("multer"));
const lambert_server_1 = require("lambert-server");
const router = (0, express_1.Router)();
router.get("/", (0, api_1.route)({}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { guild_id } = req.params;
    yield util_1.Member.IsInGuildOrFail(req.user_id, guild_id);
    res.json(yield util_1.Sticker.find({ guild_id }));
}));
const bodyParser = (0, multer_1.default)({
    limits: {
        fileSize: 1024 * 1024 * 100,
        fields: 10,
        files: 1
    },
    storage: multer_1.default.memoryStorage()
}).single("file");
router.post("/", bodyParser, (0, api_1.route)({ permission: "MANAGE_EMOJIS_AND_STICKERS", body: "ModifyGuildStickerSchema" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file)
        throw new lambert_server_1.HTTPError("missing file");
    const { guild_id } = req.params;
    const body = req.body;
    const id = util_1.Snowflake.generate();
    const [sticker] = yield Promise.all([
        new util_1.Sticker(Object.assign(Object.assign({}, body), { guild_id,
            id, type: util_1.StickerType.GUILD, format_type: getStickerFormat(req.file.mimetype), available: true })).save(),
        (0, util_1.uploadFile)(`/stickers/${id}`, req.file)
    ]);
    yield sendStickerUpdateEvent(guild_id);
    res.json(sticker);
}));
function getStickerFormat(mime_type) {
    switch (mime_type) {
        case "image/apng":
            return util_1.StickerFormatType.APNG;
        case "application/json":
            return util_1.StickerFormatType.LOTTIE;
        case "image/png":
            return util_1.StickerFormatType.PNG;
        case "image/gif":
            return util_1.StickerFormatType.GIF;
        default:
            throw new lambert_server_1.HTTPError("invalid sticker format: must be png, apng or lottie");
    }
}
exports.getStickerFormat = getStickerFormat;
router.get("/:sticker_id", (0, api_1.route)({}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { guild_id, sticker_id } = req.params;
    yield util_1.Member.IsInGuildOrFail(req.user_id, guild_id);
    res.json(yield util_1.Sticker.findOneOrFail({ guild_id, id: sticker_id }));
}));
router.patch("/:sticker_id", (0, api_1.route)({ body: "ModifyGuildStickerSchema", permission: "MANAGE_EMOJIS_AND_STICKERS" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { guild_id, sticker_id } = req.params;
    const body = req.body;
    const sticker = yield new util_1.Sticker(Object.assign(Object.assign({}, body), { guild_id, id: sticker_id })).save();
    yield sendStickerUpdateEvent(guild_id);
    return res.json(sticker);
}));
function sendStickerUpdateEvent(guild_id) {
    return __awaiter(this, void 0, void 0, function* () {
        return (0, util_1.emitEvent)({
            event: "GUILD_STICKERS_UPDATE",
            guild_id: guild_id,
            data: {
                guild_id: guild_id,
                stickers: yield util_1.Sticker.find({ guild_id: guild_id })
            }
        });
    });
}
router.delete("/:sticker_id", (0, api_1.route)({ permission: "MANAGE_EMOJIS_AND_STICKERS" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { guild_id, sticker_id } = req.params;
    yield util_1.Sticker.delete({ guild_id, id: sticker_id });
    yield sendStickerUpdateEvent(guild_id);
    return res.sendStatus(204);
}));
exports.default = router;
