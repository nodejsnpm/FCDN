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
const lambert_server_1 = require("lambert-server");
const api_1 = require("../../../index");
const api_2 = require("../../../index");
const router = (0, express_1.Router)();
const TemplateGuildProjection = [
    "name",
    "description",
    "region",
    "verification_level",
    "default_message_notifications",
    "explicit_content_filter",
    "preferred_locale",
    "afk_timeout",
    "roles",
    // "channels",
    "afk_channel_id",
    "system_channel_id",
    "system_channel_flags",
    "icon"
];
router.get("/", (0, api_1.route)({}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { guild_id } = req.params;
    var templates = yield util_1.Template.find({ source_guild_id: guild_id });
    return res.json(templates);
}));
router.post("/", (0, api_1.route)({ body: "TemplateCreateSchema", permission: "MANAGE_GUILD" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { guild_id } = req.params;
    const guild = yield util_1.Guild.findOneOrFail({ where: { id: guild_id }, select: TemplateGuildProjection });
    const exists = yield util_1.Template.findOneOrFail({ id: guild_id }).catch((e) => { });
    if (exists)
        throw new lambert_server_1.HTTPError("Template already exists", 400);
    const template = yield new util_1.Template(Object.assign(Object.assign({}, req.body), { code: (0, api_2.generateCode)(), creator_id: req.user_id, created_at: new Date(), updated_at: new Date(), source_guild_id: guild_id, serialized_source_guild: guild })).save();
    res.json(template);
}));
router.delete("/:code", (0, api_1.route)({ permission: "MANAGE_GUILD" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code, guild_id } = req.params;
    const template = yield util_1.Template.delete({
        code,
        source_guild_id: guild_id
    });
    res.json(template);
}));
router.put("/:code", (0, api_1.route)({ permission: "MANAGE_GUILD" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code, guild_id } = req.params;
    const guild = yield util_1.Guild.findOneOrFail({ where: { id: guild_id }, select: TemplateGuildProjection });
    const template = yield new util_1.Template({ code, serialized_source_guild: guild }).save();
    res.json(template);
}));
router.patch("/:code", (0, api_1.route)({ body: "TemplateModifySchema", permission: "MANAGE_GUILD" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code, guild_id } = req.params;
    const { name, description } = req.body;
    const template = yield new util_1.Template({ code, name: name, description: description, source_guild_id: guild_id }).save();
    res.json(template);
}));
exports.default = router;
