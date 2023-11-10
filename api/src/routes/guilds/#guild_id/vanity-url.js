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
const lambert_server_1 = require("lambert-server");
const router = (0, express_1.Router)();
const InviteRegex = /\W/g;
router.get("/", (0, api_1.route)({ permission: "MANAGE_GUILD" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { guild_id } = req.params;
    const invite = yield util_1.Invite.findOne({ where: { guild_id: guild_id, vanity_url: true } });
    if (!invite)
        return res.json({ code: null });
    return res.json({ code: invite.code, uses: invite.uses });
}));
// TODO: check if guild is elgible for vanity url
router.patch("/", (0, api_1.route)({ body: "VanityUrlSchema", permission: "MANAGE_GUILD" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { guild_id } = req.params;
    const body = req.body;
    const code = (_a = body.code) === null || _a === void 0 ? void 0 : _a.replace(InviteRegex, "");
    const invite = yield util_1.Invite.findOne({ code });
    if (invite)
        throw new lambert_server_1.HTTPError("Invite already exists");
    const { id } = yield util_1.Channel.findOneOrFail({ guild_id, type: util_1.ChannelType.GUILD_TEXT });
    yield util_1.Invite.update({ vanity_url: true, guild_id }, { code: code, channel_id: id });
    return res.json({ code: code });
}));
exports.default = router;
