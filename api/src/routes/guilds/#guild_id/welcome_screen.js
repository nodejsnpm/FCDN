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
const router = (0, express_1.Router)();
router.get("/", (0, api_1.route)({}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const guild_id = req.params.guild_id;
    const guild = yield util_1.Guild.findOneOrFail({ id: guild_id });
    yield util_1.Member.IsInGuildOrFail(req.user_id, guild_id);
    res.json(guild.welcome_screen);
}));
router.patch("/", (0, api_1.route)({ body: "GuildUpdateWelcomeScreenSchema", permission: "MANAGE_GUILD" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const guild_id = req.params.guild_id;
    const body = req.body;
    const guild = yield util_1.Guild.findOneOrFail({ id: guild_id });
    if (!guild.welcome_screen.enabled)
        throw new lambert_server_1.HTTPError("Welcome screen disabled", 400);
    if (body.welcome_channels)
        guild.welcome_screen.welcome_channels = body.welcome_channels; // TODO: check if they exist and are valid
    if (body.description)
        guild.welcome_screen.description = body.description;
    if (body.enabled != null)
        guild.welcome_screen.enabled = body.enabled;
    res.sendStatus(204);
}));
exports.default = router;
