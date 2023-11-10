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
const api_1 = require("../../../index");
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/", (0, api_1.route)({ permission: "MANAGE_GUILD" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { guild_id } = req.params;
    const invites = yield util_1.Invite.find({ where: { guild_id }, relations: util_1.PublicInviteRelation });
    return res.json(invites);
}));
exports.default = router;
