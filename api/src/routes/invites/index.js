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
const lambert_server_1 = require("lambert-server");
const router = (0, express_1.Router)();
router.get("/:code", (0, api_1.route)({}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code } = req.params;
    const invite = yield util_1.Invite.findOneOrFail({ where: { code }, relations: util_1.PublicInviteRelation });
    res.status(200).send(invite);
}));
router.post("/:code", (0, api_1.route)({}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code } = req.params;
    const invite = yield util_1.Invite.joinGuild(req.user_id, code);
    res.json(invite);
}));
// * cant use permission of route() function because path doesn't have guild_id/channel_id
router.delete("/:code", (0, api_1.route)({}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code } = req.params;
    const invite = yield util_1.Invite.findOneOrFail({ code });
    const { guild_id, channel_id } = invite;
    const permission = yield (0, util_1.getPermission)(req.user_id, guild_id, channel_id);
    if (!permission.has("MANAGE_GUILD") && !permission.has("MANAGE_CHANNELS"))
        throw new lambert_server_1.HTTPError("You missing the MANAGE_GUILD or MANAGE_CHANNELS permission", 401);
    yield Promise.all([
        util_1.Invite.delete({ code }),
        (0, util_1.emitEvent)({
            event: "INVITE_DELETE",
            guild_id: guild_id,
            data: {
                channel_id: channel_id,
                guild_id: guild_id,
                code: code
            }
        })
    ]);
    res.json({ invite: invite });
}));
exports.default = router;
