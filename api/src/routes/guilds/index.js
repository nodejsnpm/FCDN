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
const util_1 = require("../../../../util/src/index");
const api_1 = require("../../index");
const router = (0, express_1.Router)();
//TODO: create default channel
router.post("/", (0, api_1.route)({ body: "GuildCreateSchema" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const body = req.body;
    const { maxGuilds } = util_1.Config.get().limits.user;
    const guild_count = yield util_1.Member.count({ id: req.user_id });
    if (guild_count >= maxGuilds) {
        throw util_1.DiscordApiErrors.MAXIMUM_GUILDS.withParams(maxGuilds);
    }
    const guild = yield util_1.Guild.createGuild(Object.assign(Object.assign({}, body), { owner_id: req.user_id }));
    const { autoJoin } = util_1.Config.get().guild;
    if (autoJoin.enabled && !((_a = autoJoin.guilds) === null || _a === void 0 ? void 0 : _a.length)) {
        // @ts-ignore
        yield util_1.Config.set({ guild: { autoJoin: { guilds: [guild.id] } } });
    }
    yield util_1.Member.addToGuild(req.user_id, guild.id);
    res.status(201).json({ id: guild.id });
}));
exports.default = router;
