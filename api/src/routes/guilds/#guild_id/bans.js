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
router.get("/", (0, api_1.route)({ permission: "BAN_MEMBERS" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { guild_id } = req.params;
    var bans = yield util_1.Ban.find({ guild_id: guild_id });
    return res.json(bans);
}));
router.get("/:user", (0, api_1.route)({ permission: "BAN_MEMBERS" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { guild_id } = req.params;
    const user_id = req.params.ban;
    var ban = yield util_1.Ban.findOneOrFail({ guild_id: guild_id, user_id: user_id });
    return res.json(ban);
}));
router.put("/:user_id", (0, api_1.route)({ body: "BanCreateSchema", permission: "BAN_MEMBERS" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { guild_id } = req.params;
    const banned_user_id = req.params.user_id;
    const banned_user = yield util_1.User.getPublicUser(banned_user_id);
    if (req.user_id === banned_user_id)
        throw new lambert_server_1.HTTPError("You can't ban yourself", 400);
    if (((_a = req.permission.cache.guild) === null || _a === void 0 ? void 0 : _a.owner_id) === banned_user_id)
        throw new lambert_server_1.HTTPError("You can't ban the owner", 400);
    const ban = new util_1.Ban({
        user_id: banned_user_id,
        guild_id: guild_id,
        ip: (0, api_1.getIpAdress)(req),
        executor_id: req.user_id,
        reason: req.body.reason // || otherwise empty
    });
    yield Promise.all([
        util_1.Member.removeFromGuild(banned_user_id, guild_id),
        ban.save(),
        (0, util_1.emitEvent)({
            event: "GUILD_BAN_ADD",
            data: {
                guild_id: guild_id,
                user: banned_user
            },
            guild_id: guild_id
        })
    ]);
    return res.json(ban);
}));
router.delete("/:user_id", (0, api_1.route)({ permission: "BAN_MEMBERS" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { guild_id, user_id } = req.params;
    const banned_user = yield util_1.User.getPublicUser(user_id);
    yield Promise.all([
        util_1.Ban.delete({
            user_id: user_id,
            guild_id
        }),
        (0, util_1.emitEvent)({
            event: "GUILD_BAN_REMOVE",
            data: {
                guild_id,
                user: banned_user
            },
            guild_id
        })
    ]);
    return res.status(204).send();
}));
exports.default = router;
