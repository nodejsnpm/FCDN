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
// https://discord.com/developers/docs/resources/guild#get-guild-widget-settings
router.get("/", (0, api_1.route)({}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { guild_id } = req.params;
    const guild = yield util_1.Guild.findOneOrFail({ id: guild_id });
    return res.json({ enabled: guild.widget_enabled || false, channel_id: guild.widget_channel_id || null });
}));
// https://discord.com/developers/docs/resources/guild#modify-guild-widget
router.patch("/", (0, api_1.route)({ body: "WidgetModifySchema", permission: "MANAGE_GUILD" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const { guild_id } = req.params;
    yield util_1.Guild.update({ id: guild_id }, { widget_enabled: body.enabled, widget_channel_id: body.channel_id });
    // Widget invite for the widget_channel_id gets created as part of the /guilds/{guild.id}/widget.json request
    return res.json(body);
}));
exports.default = router;
