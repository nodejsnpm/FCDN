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
const util_1 = require("../../../../../../../util/src/index");
const lambert_server_1 = require("lambert-server");
const api_1 = require("../../../../../index");
const router = (0, express_1.Router)();
router.get("/", (0, api_1.route)({}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { guild_id, member_id } = req.params;
    yield util_1.Member.IsInGuildOrFail(req.user_id, guild_id);
    const member = yield util_1.Member.findOneOrFail({ id: member_id, guild_id });
    return res.json(member);
}));
router.patch("/", (0, api_1.route)({ body: "MemberChangeSchema" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { guild_id, member_id } = req.params;
    if (member_id === "@me")
        member_id = req.user_id;
    const body = req.body;
    const member = yield util_1.Member.findOneOrFail({ where: { id: member_id, guild_id }, relations: ["roles", "user"] });
    const permission = yield (0, util_1.getPermission)(req.user_id, guild_id);
    if (body.roles) {
        permission.hasThrow("MANAGE_ROLES");
        member.roles = body.roles.map((x) => new util_1.Role({ id: x })); // foreign key constraint will fail if role doesn't exist
    }
    yield member.save();
    // do not use promise.all as we have to first write to db before emitting the event to catch errors
    yield (0, util_1.emitEvent)({
        event: "GUILD_MEMBER_UPDATE",
        guild_id,
        data: Object.assign(Object.assign({}, member), { roles: member.roles.map((x) => x.id) })
    });
    res.json(member);
}));
router.put("/", (0, api_1.route)({}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { guild_id, member_id } = req.params;
    if (member_id === "@me")
        member_id = req.user_id;
    throw new lambert_server_1.HTTPError("Maintenance: Currently you can't add a member", 403);
    // TODO: only for oauth2 applications
    yield util_1.Member.addToGuild(member_id, guild_id);
    res.sendStatus(204);
}));
router.delete("/", (0, api_1.route)({ permission: "KICK_MEMBERS" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { guild_id, member_id } = req.params;
    yield util_1.Member.removeFromGuild(member_id, guild_id);
    res.sendStatus(204);
}));
exports.default = router;
