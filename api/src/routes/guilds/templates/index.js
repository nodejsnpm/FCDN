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
const express_1 = require("express");
const util_1 = require("../../../../../util/src/index");
const api_1 = require("../../../index");
const util_2 = require("../../../../../util/src/index");
const node_fetch_1 = __importDefault(require("node-fetch"));
const router = (0, express_1.Router)();
router.get("/:code", (0, api_1.route)({}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { allowDiscordTemplates, allowRaws, enabled } = util_1.Config.get().templates;
    if (!enabled)
        res.json({ code: 403, message: "Template creation & usage is disabled on this instance." }).sendStatus(403);
    const { code } = req.params;
    if (code.startsWith("discord:")) {
        if (!allowDiscordTemplates)
            return res.json({ code: 403, message: "Discord templates cannot be used on this instance." }).sendStatus(403);
        const discordTemplateID = code.split("discord:", 2)[1];
        const discordTemplateData = yield (0, node_fetch_1.default)(`https://discord.com/api/v9/guilds/templates/${discordTemplateID}`, {
            method: "get",
            headers: { "Content-Type": "application/json" }
        });
        return res.json(yield discordTemplateData.json());
    }
    if (code.startsWith("external:")) {
        if (!allowRaws)
            return res.json({ code: 403, message: "Importing raws is disabled on this instance." }).sendStatus(403);
        return res.json(code.split("external:", 2)[1]);
    }
    const template = yield util_1.Template.findOneOrFail({ code: code });
    res.json(template);
}));
router.post("/:code", (0, api_1.route)({ body: "GuildTemplateCreateSchema" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { enabled, allowTemplateCreation, allowDiscordTemplates, allowRaws } = util_1.Config.get().templates;
    if (!enabled)
        return res.json({ code: 403, message: "Template creation & usage is disabled on this instance." }).sendStatus(403);
    if (!allowTemplateCreation)
        return res.json({ code: 403, message: "Template creation is disabled on this instance." }).sendStatus(403);
    const { code } = req.params;
    const body = req.body;
    const { maxGuilds } = util_1.Config.get().limits.user;
    const guild_count = yield util_1.Member.count({ id: req.user_id });
    if (guild_count >= maxGuilds) {
        throw util_2.DiscordApiErrors.MAXIMUM_GUILDS.withParams(maxGuilds);
    }
    const template = yield util_1.Template.findOneOrFail({ code: code });
    const guild_id = util_1.Snowflake.generate();
    const [guild, role] = yield Promise.all([
        new util_1.Guild(Object.assign(Object.assign(Object.assign({}, body), template.serialized_source_guild), { id: guild_id, owner_id: req.user_id })).save(),
        new util_1.Role({
            id: guild_id,
            guild_id: guild_id,
            color: 0,
            hoist: false,
            managed: true,
            mentionable: true,
            name: "@everyone",
            permissions: BigInt("2251804225"),
            position: 0,
            tags: null
        }).save()
    ]);
    yield util_1.Member.addToGuild(req.user_id, guild_id);
    res.status(201).json({ id: guild.id });
}));
exports.default = router;
