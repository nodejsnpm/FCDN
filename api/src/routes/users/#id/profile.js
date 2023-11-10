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
const api_1 = require("../../../index");
const router = (0, express_1.Router)();
router.get("/", (0, api_1.route)({ test: { response: { body: "UserProfileResponse" } } }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.params.id === "@me")
        req.params.id = req.user_id;
    const user = yield util_1.User.getPublicUser(req.params.id, { relations: ["connected_accounts"] });
    res.json({
        connected_accounts: user.connected_accounts,
        premium_guild_since: null,
        premium_since: null,
        mutual_guilds: [],
        user: {
            username: user.username,
            discriminator: user.discriminator,
            id: user.id,
            public_flags: user.public_flags,
            avatar: user.avatar,
            accent_color: user.accent_color,
            banner: user.banner,
            bio: req.user_bot ? null : user.bio,
            bot: user.bot
        }
    });
}));
exports.default = router;
