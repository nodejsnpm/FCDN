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
    yield util_1.Member.IsInGuildOrFail(req.user_id, guild_id);
    const roles = yield util_1.Role.find({ guild_id: guild_id });
    return res.json(roles);
}));
router.post("/", (0, api_1.route)({ body: "RoleModifySchema", permission: "MANAGE_ROLES" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const guild_id = req.params.guild_id;
    const body = req.body;
    const role_count = yield util_1.Role.count({ guild_id });
    const { maxRoles } = util_1.Config.get().limits.guild;
    if (role_count > maxRoles)
        throw util_1.DiscordApiErrors.MAXIMUM_ROLES.withParams(maxRoles);
    const role = new util_1.Role(Object.assign(Object.assign({ 
        // values before ...body are default and can be overriden
        position: 0, hoist: false, color: 0, mentionable: false }, body), { guild_id: guild_id, managed: false, permissions: String(req.permission.bitfield & BigInt(body.permissions || "0")), tags: undefined }));
    yield Promise.all([
        role.save(),
        (0, util_1.emitEvent)({
            event: "GUILD_ROLE_CREATE",
            guild_id,
            data: {
                guild_id,
                role: role
            }
        })
    ]);
    res.json(role);
}));
router.delete("/:role_id", (0, api_1.route)({ permission: "MANAGE_ROLES" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const guild_id = req.params.guild_id;
    const { role_id } = req.params;
    if (role_id === guild_id)
        throw new lambert_server_1.HTTPError("You can't delete the @everyone role");
    yield Promise.all([
        util_1.Role.delete({
            id: role_id,
            guild_id: guild_id
        }),
        (0, util_1.emitEvent)({
            event: "GUILD_ROLE_DELETE",
            guild_id,
            data: {
                guild_id,
                role_id
            }
        })
    ]);
    res.sendStatus(204);
}));
// TODO: check role hierarchy
router.patch("/:role_id", (0, api_1.route)({ body: "RoleModifySchema", permission: "MANAGE_ROLES" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { role_id, guild_id } = req.params;
    const body = req.body;
    const role = new util_1.Role(Object.assign(Object.assign({}, body), { id: role_id, guild_id, permissions: String(req.permission.bitfield & BigInt(body.permissions || "0")) }));
    yield Promise.all([
        role.save(),
        (0, util_1.emitEvent)({
            event: "GUILD_ROLE_UPDATE",
            guild_id,
            data: {
                guild_id,
                role
            }
        })
    ]);
    res.json(role);
}));
router.patch("/", (0, api_1.route)({ body: "RolePositionUpdateSchema" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { guild_id } = req.params;
    const body = req.body;
    const perms = yield (0, util_1.getPermission)(req.user_id, guild_id);
    perms.hasThrow("MANAGE_ROLES");
    yield Promise.all(body.map((x) => __awaiter(void 0, void 0, void 0, function* () { return util_1.Role.update({ guild_id, id: x.id }, { position: x.position }); })));
    const roles = yield util_1.Role.find({ where: body.map((x) => ({ id: x.id, guild_id })) });
    yield Promise.all(roles.map((x) => (0, util_1.emitEvent)({
        event: "GUILD_ROLE_UPDATE",
        guild_id,
        data: {
            guild_id,
            role: x
        }
    })));
    res.json(roles);
}));
exports.default = router;
