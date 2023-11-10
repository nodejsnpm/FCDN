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
require("missing-native-js-functions");
const router = (0, express_1.Router)();
router.get("/", (0, api_1.route)({}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { guild_id } = req.params;
    const [guild, member] = yield Promise.all([
        util_1.Guild.findOneOrFail({ id: guild_id }),
        util_1.Member.findOne({ guild_id: guild_id, id: req.user_id })
    ]);
    if (!member)
        throw new lambert_server_1.HTTPError("You are not a member of the guild you are trying to access", 401);
    // @ts-ignore
    guild.joined_at = member === null || member === void 0 ? void 0 : member.joined_at;
    return res.json(guild);
}));
router.patch("/", (0, api_1.route)({ body: "GuildUpdateSchema", permission: "MANAGE_GUILD" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const { guild_id } = req.params;
    // TODO: guild update check image
    if (body.icon)
        body.icon = yield (0, util_1.handleFile)(`/icons/${guild_id}`, body.icon);
    if (body.banner)
        body.banner = yield (0, util_1.handleFile)(`/banners/${guild_id}`, body.banner);
    if (body.splash)
        body.splash = yield (0, util_1.handleFile)(`/splashes/${guild_id}`, body.splash);
    var guild = yield util_1.Guild.findOneOrFail({
        where: { id: guild_id },
        relations: ["emojis", "roles", "stickers"]
    });
    // TODO: check if body ids are valid
    guild.assign(body);
    const data = guild.toJSON();
    // TODO: guild hashes
    // TODO: fix vanity_url_code, template_id
    delete data.vanity_url_code;
    delete data.template_id;
    yield Promise.all([guild.save(), (0, util_1.emitEvent)({ event: "GUILD_UPDATE", data, guild_id })]);
    return res.json(data);
}));
exports.default = router;
