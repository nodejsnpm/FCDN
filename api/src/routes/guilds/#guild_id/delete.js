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
// discord prefixes this route with /delete instead of using the delete method
// docs are wrong https://discord.com/developers/docs/resources/guild#delete-guild
router.post("/", (0, api_1.route)({}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { guild_id } = req.params;
    const guild = yield util_1.Guild.findOneOrFail({ where: { id: guild_id }, select: ["owner_id"] });
    if (guild.owner_id !== req.user_id)
        throw new lambert_server_1.HTTPError("You are not the owner of this guild", 401);
    yield Promise.all([
        util_1.Guild.delete({ id: guild_id }),
        (0, util_1.emitEvent)({
            event: "GUILD_DELETE",
            data: {
                id: guild_id
            },
            guild_id: guild_id
        })
    ]);
    return res.sendStatus(204);
}));
exports.default = router;
