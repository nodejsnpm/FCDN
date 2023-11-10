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
const util_1 = require("../../../../../../../util/src/index");
const api_1 = require("../../../../../index");
const express_1 = require("express");
const router = (0, express_1.Router)();
router.patch("/", (0, api_1.route)({ body: "MemberNickChangeSchema" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { guild_id, member_id } = req.params;
    var permissionString = "MANAGE_NICKNAMES";
    if (member_id === "@me") {
        member_id = req.user_id;
        permissionString = "CHANGE_NICKNAME";
    }
    const perms = yield (0, util_1.getPermission)(req.user_id, guild_id);
    perms.hasThrow(permissionString);
    yield util_1.Member.changeNickname(member_id, guild_id, req.body.nick);
    res.status(200).send();
}));
exports.default = router;
