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
const util_1 = require("../../../../../../util/src/index");
const api_1 = require("../../../../index");
const typeorm_1 = require("typeorm");
const lambert_server_1 = require("lambert-server");
const router = (0, express_1.Router)();
// TODO: not allowed for user -> only allowed for bots with privileged intents
// TODO: send over websocket
// TODO: check for GUILD_MEMBERS intent
router.get("/", (0, api_1.route)({}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { guild_id } = req.params;
    const limit = Number(req.query.limit) || 1;
    if (limit > 1000 || limit < 1)
        throw new lambert_server_1.HTTPError("Limit must be between 1 and 1000");
    const after = `${req.query.after}`;
    const query = after ? { id: (0, typeorm_1.MoreThan)(after) } : {};
    yield util_1.Member.IsInGuildOrFail(req.user_id, guild_id);
    const members = yield util_1.Member.find({
        where: Object.assign({ guild_id }, query),
        select: util_1.PublicMemberProjection,
        take: limit,
        order: { id: "ASC" }
    });
    return res.json(members);
}));
exports.default = router;
