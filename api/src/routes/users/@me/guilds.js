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
    const members = yield util_1.Member.find({ relations: ["guild"], where: { id: req.user_id } });
    res.json(members.map((x) => x.guild));
}));
// user send to leave a certain guild
router.delete("/:guild_id", (0, api_1.route)({}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { autoJoin } = util_1.Config.get().guild;
    const { guild_id } = req.params;
    const guild = yield util_1.Guild.findOneOrFail({ where: { id: guild_id }, select: ["owner_id"] });
    if (!guild)
        throw new lambert_server_1.HTTPError("Guild doesn't exist", 404);
    if (guild.owner_id === req.user_id)
        throw new lambert_server_1.HTTPError("You can't leave your own guild", 400);
    if (autoJoin.enabled && autoJoin.guilds.includes(guild_id) && !autoJoin.canLeave) {
        throw new lambert_server_1.HTTPError("You can't leave instance auto join guilds", 400);
    }
    yield Promise.all([
        util_1.Member.delete({ id: req.user_id, guild_id: guild_id }),
        (0, util_1.emitEvent)({
            event: "GUILD_DELETE",
            data: {
                id: guild_id
            },
            user_id: req.user_id
        })
    ]);
    const user = yield util_1.User.getPublicUser(req.user_id);
    yield (0, util_1.emitEvent)({
        event: "GUILD_MEMBER_REMOVE",
        data: {
            guild_id: guild_id,
            user: user
        },
        guild_id: guild_id
    });
    return res.sendStatus(204);
}));
exports.default = router;
