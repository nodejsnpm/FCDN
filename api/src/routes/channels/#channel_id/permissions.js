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
const lambert_server_1 = require("lambert-server");
const api_1 = require("../../../index");
const router = (0, express_1.Router)();
router.put("/:overwrite_id", (0, api_1.route)({ body: "ChannelPermissionOverwriteSchema", permission: "MANAGE_ROLES" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { channel_id, overwrite_id } = req.params;
    const body = req.body;
    var channel = yield util_1.Channel.findOneOrFail({ id: channel_id });
    if (!channel.guild_id)
        throw new lambert_server_1.HTTPError("Channel not found", 404);
    if (body.type === 0) {
        if (!(yield util_1.Role.count({ id: overwrite_id })))
            throw new lambert_server_1.HTTPError("role not found", 404);
    }
    else if (body.type === 1) {
        if (!(yield util_1.Member.count({ id: overwrite_id })))
            throw new lambert_server_1.HTTPError("user not found", 404);
    }
    else
        throw new lambert_server_1.HTTPError("type not supported", 501);
    // @ts-ignore
    var overwrite = channel.permission_overwrites.find((x) => x.id === overwrite_id);
    if (!overwrite) {
        // @ts-ignore
        overwrite = {
            id: overwrite_id,
            type: body.type
        };
        channel.permission_overwrites.push(overwrite);
    }
    overwrite.allow = String(req.permission.bitfield & (BigInt(body.allow) || BigInt("0")));
    overwrite.deny = String(req.permission.bitfield & (BigInt(body.deny) || BigInt("0")));
    yield Promise.all([
        channel.save(),
        (0, util_1.emitEvent)({
            event: "CHANNEL_UPDATE",
            channel_id,
            data: channel
        })
    ]);
    return res.sendStatus(204);
}));
// TODO: check permission hierarchy
router.delete("/:overwrite_id", (0, api_1.route)({ permission: "MANAGE_ROLES" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { channel_id, overwrite_id } = req.params;
    const channel = yield util_1.Channel.findOneOrFail({ id: channel_id });
    if (!channel.guild_id)
        throw new lambert_server_1.HTTPError("Channel not found", 404);
    channel.permission_overwrites = channel.permission_overwrites.filter((x) => x.id === overwrite_id);
    yield Promise.all([
        channel.save(),
        (0, util_1.emitEvent)({
            event: "CHANNEL_UPDATE",
            channel_id,
            data: channel
        })
    ]);
    return res.sendStatus(204);
}));
exports.default = router;
