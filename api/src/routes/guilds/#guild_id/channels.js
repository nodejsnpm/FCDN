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
    const { guild_id } = req.params;
    const channels = yield util_1.Channel.find({ guild_id });
    res.json(channels);
}));
router.post("/", (0, api_1.route)({ body: "ChannelModifySchema", permission: "MANAGE_CHANNELS" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // creates a new guild channel https://discord.com/developers/docs/resources/guild#create-guild-channel
    const { guild_id } = req.params;
    const body = req.body;
    const channel = yield util_1.Channel.createChannel(Object.assign(Object.assign({}, body), { guild_id }), req.user_id);
    res.status(201).json(channel);
}));
router.patch("/", (0, api_1.route)({ body: "ChannelReorderSchema", permission: "MANAGE_CHANNELS" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // changes guild channel position
    const { guild_id } = req.params;
    const body = req.body;
    yield Promise.all([
        body.map((x) => __awaiter(void 0, void 0, void 0, function* () {
            if (x.position == null && !x.parent_id)
                throw new lambert_server_1.HTTPError(`You need to at least specify position or parent_id`, 400);
            const opts = {};
            if (x.position != null)
                opts.position = x.position;
            if (x.parent_id) {
                opts.parent_id = x.parent_id;
                const parent_channel = yield util_1.Channel.findOneOrFail({
                    where: { id: x.parent_id, guild_id },
                    select: ["permission_overwrites"]
                });
                if (x.lock_permissions) {
                    opts.permission_overwrites = parent_channel.permission_overwrites;
                }
            }
            yield util_1.Channel.update({ guild_id, id: x.id }, opts);
            const channel = yield util_1.Channel.findOneOrFail({ guild_id, id: x.id });
            yield (0, util_1.emitEvent)({ event: "CHANNEL_UPDATE", data: channel, channel_id: x.id, guild_id });
        }))
    ]);
    res.sendStatus(204);
}));
exports.default = router;
